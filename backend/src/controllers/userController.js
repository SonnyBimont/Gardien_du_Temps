const { User, Structure, TimeTracking, Task, ActivityLog } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Vérification des modèles
const checkModels = () => {
  if (!User || !Structure || !TimeTracking) {
    console.error('Erreur: Modèles non importés correctement');
    console.log('User:', !!User);
    console.log('Structure:', !!Structure);
    console.log('TimeTracking:', !!TimeTracking);
    console.log('Task:', !!Task);
  }
};
checkModels();

// ===== NOUVELLES FONCTIONS POUR PÉRIODES FIXES =====

// Calculer le début et fin de semaine (Lundi à Dimanche)
const getCurrentWeekRange = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Dimanche, 1 = Lundi...
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Ajuster pour commencer lundi
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

// Calculer le début et fin de mois (1er au dernier jour)
const getCurrentMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Calculer le début et fin d'année (Janvier à Décembre)
const getCurrentYearRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1); // 1er janvier
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), 11, 31); // 31 décembre
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Semaine précédente
const getPreviousWeekRange = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const currentDay = lastWeek.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const monday = new Date(lastWeek);
  monday.setDate(lastWeek.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
};

// Mois précédent
const getPreviousMonthRange = () => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return { start: firstDay, end: lastDay };
};

// Fonction utilitaire pour calculer les dates selon le type de période
const calculateDateRange = (period) => {
  switch (period) {
    case 'current_week':
      return getCurrentWeekRange();
    case 'current_month':
      return getCurrentMonthRange();
    case 'current_year':
      return getCurrentYearRange();
    case 'previous_week':
      return getPreviousWeekRange();
    case 'previous_month':
      return getPreviousMonthRange();
    case 'last_7_days':
      // Fallback vers 7 jours glissants si nécessaire
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const today7 = new Date();
      today7.setHours(23, 59, 59, 999);
      return { start: sevenDaysAgo, end: today7 };
    case 'last_30_days':
      // Fallback vers 30 jours glissants si nécessaire
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const today30 = new Date();
      today30.setHours(23, 59, 59, 999);
      return { start: thirtyDaysAgo, end: today30 };
    default:
      return getCurrentWeekRange();
  }
};

// ===== FONCTIONS UTILITAIRES EXISTANTES (INCHANGÉES) =====

const subDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

// ===== GESTION DES UTILISATEURS =====

// Récupérer tous les utilisateurs (avec filtres admin)
exports.getUsers = async (req, res) => {
    try {
        const { 
            includeInactive = 'true',
            structureId,
            role,
            search 
        } = req.query;

        const whereConditions = {};
        
        // TOUJOURS inclure les inactifs sauf si explicitement demandé
        if (includeInactive === 'false') {
            whereConditions.active = true;
        }
        // Sinon on récupère TOUS les utilisateurs (actifs et inactifs)
        
        if (structureId) {
            whereConditions.structure_id = structureId;
        }
        
        if (role) {
            whereConditions.role = role;
        }
        
        if (search) {
            whereConditions[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        console.log('🔍 Conditions de recherche utilisateurs:', whereConditions);

        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            where: whereConditions,
            include: [{ 
                model: Structure, 
                as: 'structure',
                attributes: ['id', 'name', 'city']
            }],
            order: [['active', 'DESC'], ['createdAt', 'DESC']]
        });

        console.log(`📊 Trouvé ${users.length} utilisateurs (actifs: ${users.filter(u => u.active).length}, inactifs: ${users.filter(u => !u.active).length})`);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Erreur getUsers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs', 
            error: error.message 
        });
    }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier les permissions
        if (req.user.role !== 'admin' && req.user.role !== 'director' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Accès refusé' 
            });
        }

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ 
                model: Structure, 
                as: 'structure',
                attributes: ['id', 'name', 'city']
            }]
        });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Erreur getUserById:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur', 
            error: error.message 
        });
    }
};

// Créer un utilisateur
exports.createUser = async (req, res) => {
    try {
        const {
            email,
            password,
            first_name,
            last_name,
            role,
            structure_id,
            phone,
            contract_type,      
            weekly_hours,       
            annual_hours,       
            contract_start_date,
            contract_end_date,  
            active
        } = req.body;

        // Validation des permissions
        if (req.user.role !== 'admin' && role === 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Seuls les administrateurs peuvent créer des comptes admin' 
            });
        }

        // Validation des champs obligatoires selon votre modèle User
        if (!email || !password || !first_name || !last_name || !structure_id || !contract_type) {
            return res.status(400).json({ 
                success: false,
                message: 'Les champs email, mot de passe, prénom, nom, structure et type de contrat sont obligatoires' 
            });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Un utilisateur avec cet email existe déjà' 
            });
        }

        // Vérification que la structure existe
        const structure = await Structure.findByPk(structure_id);
        if (!structure) {
            return res.status(400).json({ 
                success: false,
                message: 'Structure non trouvée' 
            });
        }

        // Hachage du mot de passe
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        // Création de l'utilisateur avec TOUS les champs requis
        const user = await User.create({
            email,
            password: hashedPassword,
            first_name,
            last_name,
            role: role || 'animator',
            structure_id: parseInt(structure_id),
            phone,
            contract_type,
            weekly_hours: parseFloat(weekly_hours),
            annual_hours: parseFloat(annual_hours),
            contract_start_date: contract_start_date || null,
            contract_end_date: contract_end_date || null,
            active: active !== undefined ? active : true
        });

        // Réponse sans mot de passe
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                structure_id: user.structure_id,
                active: user.active
            }
        });
    } catch (error) {
        console.error('Erreur createUser:', error);
        
        // Gestion des erreurs de validation Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Gestion des erreurs de contraintes (email unique, etc.)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur',
            error: error.message
        });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      last_name, 
      email, 
      annual_hours, 
      is_active, 
      role,
      year_type // ✅ AJOUTER
    } = req.body;

    // ✅ AJOUTER : Validation du year_type
    if (year_type && !['civil', 'school'].includes(year_type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type d\'année doit être "civil" ou "school"'
      });
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await User.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    // Construire l'objet de mise à jour
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (annual_hours !== undefined) updateData.annual_hours = annual_hours;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role !== undefined) updateData.role = role;
    if (year_type !== undefined) updateData.year_type = year_type; // ✅ AJOUTER


        let canUpdate = false;

        if (currentUser.role === 'admin') {
            canUpdate = true;
        } else if (currentUser.role === 'director') {
            // Directeur peut modifier les animateurs de sa structure
            if (userToUpdate.role === 'animator' && userToUpdate.structure_id === currentUser.structure_id) {
                canUpdate = true;
            }
            // Directeur peut modifier ses propres données
            if (userId === currentUser.id) {
                canUpdate = true;
            }
        } else {
            // Les autres peuvent seulement modifier leurs propres données
            canUpdate = userId === currentUser.id;
        }

        if (!canUpdate) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas les permissions pour modifier cet utilisateur'
            });
        }

        // Nettoyer les données de mise à jour
        const { password, ...dataToUpdate } = updateData;
        
        // Si un mot de passe est fourni, le hasher
        if (password && password.trim() !== '') {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        // Mettre à jour l'utilisateur
    const [updatedRowsCount] = await User.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

        // Récupérer l'utilisateur mis à jour avec ses relations
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer/Désactiver un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier les permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Seuls les administrateurs peuvent supprimer des utilisateurs' 
            });
        }

        // Empêcher la suppression de son propre compte
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte' 
            });
        }

        const [updated] = await User.update(
            { active: false },
            { where: { id } }
        );

        if (!updated) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Utilisateur désactivé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteUser:', error);
        res.status(400).json({ 
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur', 
            error: error.message 
        });
    }
};

// Restaurer un utilisateur
exports.restoreUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Seuls les administrateurs peuvent restaurer des utilisateurs' 
            });
        }

        const [updated] = await User.update(
            { active: true },
            { where: { id } }
        );

        if (!updated) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Utilisateur restauré avec succès'
        });
    } catch (error) {
        console.error('Erreur restoreUser:', error);
        res.status(400).json({ 
            success: false,
            message: 'Erreur lors de la restauration de l\'utilisateur', 
            error: error.message 
        });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        // Vérifications de permissions
        if (req.user.role !== 'admin' && req.user.role !== 'director') {
            return res.status(403).json({ 
                success: false,
                message: 'Permissions insuffisantes' 
            });
        }

        // Empêcher la désactivation de son propre compte
        if (req.user.id === parseInt(id) && !active) {
            return res.status(400).json({ 
                success: false,
                message: 'Vous ne pouvez pas désactiver votre propre compte' 
            });
        }

        const [updated] = await User.update(
            { active },
            { where: { id } }
        );

        if (!updated) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Structure, as: 'structure' }]
        });

        res.status(200).json({
            success: true,
            message: `Utilisateur ${active ? 'activé' : 'désactivé'} avec succès`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Erreur toggleUserStatus:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la modification du statut', 
            error: error.message 
        });
    }
};
   
exports.updateProfile = async (req, res) => {
  try {
    // ✅ AJOUTER : Logs de debug
    console.log('🔍 Headers authorization:', req.headers.authorization);
    console.log('🔍 req.user complet:', req.user);
    console.log('🔍 req.user.id:', req.user?.id);
    console.log('🔍 Type de req.user.id:', typeof req.user?.id);
    console.log('🔍 req.body:', req.body);
    
    // ✅ VÉRIFIER : Si req.user existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié ou ID manquant',
        debug: {
          hasReqUser: !!req.user,
          userKeys: req.user ? Object.keys(req.user) : null
        }
      });
    }
    
    const userId = req.user.id;
    const { 
      first_name, 
      last_name, 
      email, 
      annual_hours,
      year_type 
    } = req.body;

    // ✅ AJOUTER : Validation du year_type
    if (year_type && !['civil', 'school'].includes(year_type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type d\'année doit être "civil" ou "school"'
      });
    }

    // Construire l'objet de mise à jour
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (annual_hours !== undefined) updateData.annual_hours = annual_hours;
    if (year_type !== undefined) updateData.year_type = year_type;

    console.log('🔄 Données à mettre à jour:', updateData);

    // Vérifier si l'email existe déjà (si fourni)
    if (email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: userId }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        });
      }
    }

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: userId }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    console.log('✅ Utilisateur mis à jour:', updatedUser.toJSON());

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// ===== STATISTIQUES ADMIN AVEC PÉRIODES FIXES =====

// Statistiques générales avec support des périodes fixes
exports.getStats = async (req, res) => {
    try {
        console.log('📊 getStats appelé avec query:', req.query);
        
        // Vérification des modèles essentiels
        if (!User || !Structure) {
            throw new Error('Modèles User ou Structure non disponibles');
        }

        const { days, startDate, endDate } = req.query;
        let dateRange;

        // NOUVEAU: Support des périodes fixes via startDate/endDate
        if (startDate && endDate) {
            dateRange = {
                start: new Date(startDate + 'T00:00:00.000Z'),
                end: new Date(endDate + 'T23:59:59.999Z')
            };
            console.log('📅 Utilisation période fixe:', dateRange);
        } else if (days) {
            // Fallback vers la logique actuelle (jours glissants)
            dateRange = {
                start: subDays(new Date(), parseInt(days)),
                end: new Date()
            };
            console.log('📅 Utilisation période glissante:', days, 'jours depuis:', dateRange.start);
        } else {
            // Par défaut: semaine en cours
            dateRange = getCurrentWeekRange();
            console.log('📅 Utilisation semaine en cours par défaut:', dateRange);
        }

        // Calculs de base (toujours disponibles)
        const totalUsers = await User.count({ 
            where: { role: { [Op.ne]: 'admin' } } 
        });
        
        const activeUsers = await User.count({ 
            where: { 
                active: true, 
                role: { [Op.ne]: 'admin' } 
            } 
        });

        const totalStructures = await Structure.count();

        const newUsersInPeriod = await User.count({
            where: {
                role: { [Op.ne]: 'admin' },
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        // Calculs avec TimeTracking (optionnels)
        let totalEntries = 0;
        let activeUsersInPeriod = 0;

        if (TimeTracking) {
            try {
                totalEntries = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    }
                });

                activeUsersInPeriod = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    },
                    distinct: true,
                    col: 'user_id'
                });
            } catch (timeError) {
                console.warn('⚠️ Erreur calcul TimeTracking (non bloquant):', timeError.message);
            }
        }

        const statsData = {
            total_users: totalUsers,
            active_users: activeUsers,
            inactive_users: totalUsers - activeUsers,
            total_structures: totalStructures,
            newUsersThisWeek: newUsersInPeriod, // Nom conservé pour compatibilité frontend
            newStructuresThisWeek: newStructuresInPeriod, // Nom conservé pour compatibilité frontend
            total_entries: totalEntries,
            active_users_period: activeUsersInPeriod,
            period_info: {
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0],
                days: days || Math.ceil((dateRange.end - dateRange.start) / (24 * 60 * 60 * 1000))
            }
        };

        console.log('✅ Stats calculées:', statsData);

        res.status(200).json({
            success: true,
            data: statsData
        });
        
    } catch (error) {
        console.error('❌ Erreur getStats:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message 
        });
    }
};

// Statistiques dashboard admin avec support des périodes fixes
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('📊 getDashboardStats appelé avec query:', req.query);
        
        // Vérification des modèles essentiels
        if (!User || !Structure) {
            throw new Error('Modèles User ou Structure non disponibles');
        }
        
        const { days, startDate, endDate } = req.query;
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        
        let dateRange;

        // NOUVEAU: Support des périodes fixes via startDate/endDate
        if (startDate && endDate) {
            dateRange = {
                start: new Date(startDate + 'T00:00:00.000Z'),
                end: new Date(endDate + 'T23:59:59.999Z')
            };
            console.log('📅 Dashboard période fixe:', dateRange);
        } else if (days) {
            // Fallback vers la logique actuelle (jours glissants)
            dateRange = {
                start: subDays(today, parseInt(days)),
                end: today
            };
            console.log('📅 Dashboard période glissante:', days, 'jours depuis:', dateRange.start);
        } else {
            // Par défaut: semaine en cours
            dateRange = getCurrentWeekRange();
            console.log('📅 Dashboard semaine en cours par défaut:', dateRange);
        }

        // Calculs de base
        const totalUsers = await User.count({ 
            where: { role: { [Op.ne]: 'admin' } } 
        });
        
        const activeUsers = await User.count({ 
            where: { 
                active: true, 
                role: { [Op.ne]: 'admin' } 
            } 
        });

        const totalStructures = await Structure.count({ 
            where: { active: true } 
        });

        const newUsersInPeriod = await User.count({
            where: {
                role: { [Op.ne]: 'admin' },
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        // Calculs avec TimeTracking (optionnels)
        let todayEntries = 0;
        let activeUsersToday = 0;

        if (TimeTracking) {
            try {
                todayEntries = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: startOfToday,
                            [Op.lte]: endOfToday 
                        }
                    }
                });

                activeUsersToday = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: startOfToday,
                            [Op.lte]: endOfToday 
                        }
                    },
                    distinct: true,
                    col: 'user_id'
                });
            } catch (timeError) {
                console.warn('⚠️ Erreur calcul TimeTracking aujourd\'hui (non bloquant):', timeError.message);
            }
        }

        const dashboardData = {
            total_users: totalUsers,
            active_users: activeUsers,
            inactive_users: totalUsers - activeUsers,
            total_structures: totalStructures,
            new_users_period: newUsersInPeriod,
            new_structures_period: newStructuresInPeriod,
            today_entries: todayEntries,
            active_users_today: activeUsersToday,
            period_info: {
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0],
                days: days || Math.ceil((dateRange.end - dateRange.start) / (24 * 60 * 60 * 1000))
            },
            date: today.toISOString().split('T')[0]
        };

        console.log('✅ Dashboard stats calculées:', dashboardData);

        res.status(200).json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.error('❌ Erreur getDashboardStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des statistiques dashboard',
            error: error.message
        });
    }
};

// Activité récente des utilisateurs
exports.getRecentActivity = async (req, res) => {
    try {
        if (!TimeTracking) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'Module TimeTracking non disponible'
            });
        }        
        
        const { limit = 10 } = req.query;
        const today = startOfDay(new Date());

        const recentActivity = await TimeTracking.findAll({
            where: {
                date_time: { [Op.gte]: today }
            },
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'first_name', 'last_name', 'email'],
                    include: [
                        { 
                            model: Structure, 
                            as: 'structure', 
                            attributes: ['name'] 
                        }
                    ]
                }
            ],
            order: [['date_time', 'DESC']],
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            count: recentActivity.length,
            data: recentActivity
        });
    } catch (error) {
        console.error('Erreur getRecentActivity:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'activité récente',
            error: error.message
        });
    }
};

// ===== SYSTÈME ET AUDIT =====

// Santé du système
exports.getSystemHealth = async (req, res) => {
    try {
        const dbHealth = await User.count() >= 0; // Test simple de connectivité DB
        
        const health = {
            status: 'healthy',
            database: dbHealth ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        };

        res.status(200).json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Erreur getSystemHealth:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de la santé du système',
            error: error.message
        });
    }
};

// Logs d'audit système
exports.getAuditLogs = async (req, res) => {
    try {
        if (!ActivityLog) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'Module ActivityLog non disponible'
            });
        }

        const { limit = 50, days = 7 } = req.query;
        const startDate = subDays(new Date(), parseInt(days));

        const logs = await ActivityLog.findAll({
            where: {
                action_date: { [Op.gte]: startDate }
            },
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role'] 
                }
            ],
            order: [['action_date', 'DESC']],
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Erreur getAuditLogs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des logs d\'audit',
            error: error.message
        });
    }
};

// ===== 🆕 NOUVELLES ROUTES POUR PÉRIODES FIXES =====

// Route pour récupérer les stats avec périodes fixes
exports.getStatsWithFixedPeriods = async (req, res) => {
    try {
        console.log('📊 getStatsWithFixedPeriods appelé avec query:', req.query);
        
        // Vérification des modèles essentiels
        if (!User || !Structure) {
            console.error('❌ Modèles essentiels non disponibles');
            return res.status(500).json({
                success: false,
                message: 'Erreur de configuration serveur'
            });
        }

        const { days, startDate, endDate, period } = req.query;
        let dateRange;

        // 🆕 NOUVEAU: Support des périodes fixes via startDate/endDate OU period
        if (startDate && endDate) {
            // Cas 1: Dates explicites
            dateRange = {
                start: new Date(startDate + 'T00:00:00.000Z'),
                end: new Date(endDate + 'T23:59:59.999Z')
            };
            console.log('📅 Utilisation dates explicites:', dateRange);
        } else if (period) {
            // Cas 2: Période nommée (current_week, current_month, etc.)
            dateRange = calculateDateRange(period);
            console.log('📅 Utilisation période nommée:', period, dateRange);
        } else if (days) {
            // Cas 3: Fallback vers logique glissante
            const daysInt = parseInt(days);
            dateRange = {
                start: subDays(new Date(), daysInt),
                end: new Date()
            };
            console.log('📅 Utilisation période glissante:', daysInt, 'jours');
        } else {
            // Cas 4: Par défaut - semaine en cours
            dateRange = getCurrentWeekRange();
            console.log('📅 Utilisation période par défaut: semaine en cours');
        }

        // Calculs de base (toujours disponibles)
        const totalUsers = await User.count({ 
            where: { role: { [Op.ne]: 'admin' } } 
        });
        
        const activeUsers = await User.count({ 
            where: { 
                active: true, 
                role: { [Op.ne]: 'admin' } 
            } 
        });

        const totalStructures = await Structure.count();

        // Nouveaux utilisateurs dans la période
        const newUsersInPeriod = await User.count({
            where: {
                role: { [Op.ne]: 'admin' },
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        // Nouvelles structures dans la période
        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        // Calculs avec TimeTracking (optionnels)
        let totalEntries = 0;
        let activeUsersInPeriod = 0;

        if (TimeTracking) {
            try {
                totalEntries = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    }
                });

                activeUsersInPeriod = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    },
                    distinct: true,
                    col: 'user_id'
                });
            } catch (timeError) {
                console.warn('⚠️ Erreur calculs TimeTracking (ignorée):', timeError.message);
            }
        }

        // Calcul du libellé de période pour l'affichage
        const getPeriodLabel = () => {
            if (period) {
                const labels = {
                    'current_week': 'cette semaine',
                    'current_month': 'ce mois',
                    'current_year': 'cette année',
                    'previous_week': 'la semaine précédente',
                    'previous_month': 'le mois précédent',
                    'last_7_days': '7 derniers jours',
                    'last_30_days': '30 derniers jours'
                };
                return labels[period] || 'cette période';
            }
            if (startDate && endDate) {
                return `du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
            }
            if (days) {
                return `${days} derniers jours`;
            }
            return 'cette semaine';
        };

        // Réponse standardisée
        const statsData = {
            // Totaux globaux
            total_users: totalUsers,
            active_users: activeUsers,
            total_structures: totalStructures,
            
            // Données de la période
            period_start: dateRange.start.toISOString(),
            period_end: dateRange.end.toISOString(),
            period_label: getPeriodLabel(),
            
            // Nouvelles créations dans la période
            new_users_period: newUsersInPeriod,
            new_structures_period: newStructuresInPeriod,
            
            // Activité de la période
            total_entries: totalEntries,
            active_users_period: activeUsersInPeriod,
            
            // Compatibilité avec l'ancien format
            newUsersThisWeek: newUsersInPeriod,
            newStructuresThisWeek: newStructuresInPeriod
        };

        console.log('✅ Stats calculées:', statsData);

        res.status(200).json({
            success: true,
            data: statsData,
            meta: {
                query_params: req.query,
                calculated_range: dateRange,
                has_time_tracking: !!TimeTracking
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur getStatsWithFixedPeriods détaillée:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques',
            error: error.message,
            debug: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                query: req.query
            } : undefined
        });
    }
};

// Route pour dashboard stats avec périodes fixes
exports.getDashboardStatsWithFixedPeriods = async (req, res) => {
    try {
        console.log('📊 getDashboardStatsWithFixedPeriods appelé avec query:', req.query);
        
        const { days, startDate, endDate, period } = req.query;
        let dateRange;

        // Même logique de calcul de période que getStatsWithFixedPeriods
        if (startDate && endDate) {
            dateRange = {
                start: new Date(startDate + 'T00:00:00.000Z'),
                end: new Date(endDate + 'T23:59:59.999Z')
            };
        } else if (period) {
            dateRange = calculateDateRange(period);
        } else if (days) {
            const daysInt = parseInt(days);
            dateRange = {
                start: subDays(new Date(), daysInt),
                end: new Date()
            };
        } else {
            dateRange = getCurrentWeekRange();
        }

        // Statistiques spécifiques au dashboard
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        // Stats du jour
        let todayEntries = 0;
        let activeUsersToday = 0;

        // Stats de la période
        let periodEntries = 0;
        let uniqueUsersInPeriod = 0;

        if (TimeTracking) {
            try {
                // Aujourd'hui
                todayEntries = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: todayStart,
                            [Op.lte]: todayEnd 
                        }
                    }
                });

                activeUsersToday = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: todayStart,
                            [Op.lte]: todayEnd 
                        }
                    },
                    distinct: true,
                    col: 'user_id'
                });

                // Période sélectionnée
                periodEntries = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    }
                });

                uniqueUsersInPeriod = await TimeTracking.count({
                    where: {
                        date_time: { 
                            [Op.gte]: dateRange.start,
                            [Op.lte]: dateRange.end 
                        }
                    },
                    distinct: true,
                    col: 'user_id'
                });
            } catch (timeError) {
                console.warn('⚠️ Erreur calculs dashboard TimeTracking (ignorée):', timeError.message);
            }
        }

        // Nouvelles créations dans la période
        const newUsersInPeriod = await User.count({
            where: {
                role: { [Op.ne]: 'admin' },
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            }
        });

        const dashboardData = {
            // Stats du jour
            today_entries: todayEntries,
            active_users_today: activeUsersToday,
            today_date: today.toISOString().split('T')[0],
            
            // Stats de la période
            period_entries: periodEntries,
            unique_users_period: uniqueUsersInPeriod,
            period_start: dateRange.start.toISOString(),
            period_end: dateRange.end.toISOString(),
            
            // Nouvelles créations
            new_users_period: newUsersInPeriod,
            new_structures_period: newStructuresInPeriod,
            
            // Compatibilité ancien format
            newUsersThisWeek: newUsersInPeriod,
            newStructuresThisWeek: newStructuresInPeriod,
            todayEntries,
            activeUsersToday
        };

        console.log('✅ Dashboard stats calculées:', dashboardData);

        res.status(200).json({
            success: true,
            data: dashboardData,
            meta: {
                query_params: req.query,
                calculated_range: dateRange,
                today_range: { start: todayStart, end: todayEnd }
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur getDashboardStatsWithFixedPeriods:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques dashboard',
            error: error.message
        });
    }
};

// Route pour l'activité récente avec support des périodes
exports.getRecentActivityWithPeriod = async (req, res) => {
    try {
        console.log('📊 getRecentActivityWithPeriod appelé avec query:', req.query);
        
        if (!TimeTracking) {
            console.warn('⚠️ TimeTracking non disponible');
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'Module TimeTracking non disponible'
            });
        }

        const { limit = 10, days = 1, startDate, endDate } = req.query;
        let dateRange;

        // Calcul de la période pour l'activité récente
        if (startDate && endDate) {
            dateRange = {
                start: new Date(startDate + 'T00:00:00.000Z'),
                end: new Date(endDate + 'T23:59:59.999Z')
            };
        } else {
            // Par défaut: dernières 24h pour l'activité récente
            const daysInt = parseInt(days);
            dateRange = {
                start: subDays(new Date(), daysInt),
                end: new Date()
            };
        }

        const recentActivity = await TimeTracking.findAll({
            where: {
                date_time: { 
                    [Op.gte]: dateRange.start,
                    [Op.lte]: dateRange.end 
                }
            },
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
                    include: [{
                        model: Structure,
                        as: 'structure',
                        attributes: ['id', 'name', 'city']
                    }]
                }
            ],
            order: [['date_time', 'DESC']],
            limit: parseInt(limit)
        });

        console.log(`✅ Activité récente trouvée: ${recentActivity.length} entrées`);

        res.status(200).json({
            success: true,
            count: recentActivity.length,
            data: recentActivity,
            meta: {
                period: dateRange,
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur getRecentActivityWithPeriod:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'activité récente',
            error: error.message
        });
    }
};