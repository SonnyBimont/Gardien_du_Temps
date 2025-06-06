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
            includeInactive = 'true', // CHANGER la valeur par défaut
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
            order: [['active', 'DESC'], ['createdAt', 'DESC']] // Actifs en premier
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
                message: 'Accès non autorisé' 
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
                message: 'Champs obligatoires manquants',
                required: ['email', 'password', 'first_name', 'last_name', 'structure_id', 'contract_type']
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
                message: 'Structure introuvable'
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
                message: 'Cet email est déjà utilisé'
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
        const userId = parseInt(id);
        const updateData = req.body;
        const currentUser = req.user;

        // Récupérer l'utilisateur à modifier
        const userToUpdate = await User.findByPk(userId, {
            include: [{ model: Structure, as: 'structure' }]
        });

        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // LOGIQUE D'AUTORISATION CORRIGÉE
        let canUpdate = false;

        if (currentUser.role === 'admin') {
            // Les admins peuvent modifier tous les utilisateurs
            canUpdate = true;
        } else if (currentUser.role === 'director') {
            // Les directeurs peuvent modifier :
            // 1. Leur propre profil
            // 2. Les animateurs de leur structure
            if (currentUser.id === userId) {
                canUpdate = true; // Modification de son propre profil
            } else if (
                userToUpdate.role === 'animator' && 
                userToUpdate.structure_id === currentUser.structure_id
            ) {
                canUpdate = true; // Modification d'un animateur de sa structure
                
                // CONTRAINTE : Le directeur ne peut pas changer le rôle d'un animateur
                if (updateData.role && updateData.role !== 'animator') {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez pas modifier le rôle d\'un animateur'
                    });
                }
                
                // CONTRAINTE : Le directeur ne peut pas changer la structure
                if (updateData.structure_id && updateData.structure_id !== currentUser.structure_id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez pas déplacer un animateur vers une autre structure'
                    });
                }
            }
        } else if (currentUser.role === 'animator') {
            // Les animateurs peuvent seulement modifier leur propre profil
            if (currentUser.id === userId) {
                canUpdate = true;
                
                // CONTRAINTE : L'animateur ne peut pas changer son rôle ni sa structure
                if (updateData.role && updateData.role !== currentUser.role) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez pas modifier votre rôle'
                    });
                }
                
                if (updateData.structure_id && updateData.structure_id !== currentUser.structure_id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous ne pouvez pas modifier votre structure'
                    });
                }
            }
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
            const saltRounds = 10;
            dataToUpdate.password = await bcrypt.hash(password, saltRounds);
        }

        // Mettre à jour l'utilisateur
        await userToUpdate.update(dataToUpdate);

        // Récupérer l'utilisateur mis à jour avec ses relations
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Structure, as: 'structure' }],
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
            message: 'Erreur lors de la mise à jour de l\'utilisateur',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                message: 'Seuls les administrateurs et directeurs peuvent modifier le statut des utilisateurs' 
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
// ===== STATISTIQUES ADMIN (FUSIONNÉES) =====

// Statistiques générales
exports.getStats = async (req, res) => {
    try {
        console.log('📊 getStats appelé avec query:', req.query);
        
        // Vérification des modèles essentiels
        if (!User || !Structure) {
            console.error('❌ Modèles User ou Structure manquants');
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques',
                error: 'Modèles essentiels non disponibles'
            });
        }

        const { days = 7 } = req.query;
        const startDate = subDays(new Date(), parseInt(days));

        console.log('📅 Calcul des stats pour les', days, 'derniers jours depuis:', startDate);

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
                createdAt: { [Op.gte]: startDate }
            }
        });

        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { [Op.gte]: startDate }
            }
        });

        // Calculs avec TimeTracking (optionnels)
        let totalEntries = 0;
        let activeUsersInPeriod = 0;

        if (TimeTracking) {
            try {
                totalEntries = await TimeTracking.count({
                    where: { date_time: { [Op.gte]: startDate } }
                });
                
                activeUsersInPeriod = await TimeTracking.count({
                    distinct: true,
                    col: 'user_id',
                    where: { date_time: { [Op.gte]: startDate } }
                });
            } catch (error) {
                console.warn('⚠️  Erreur TimeTracking:', error.message);
            }
        }

        const statsData = {
            total_users: totalUsers,
            active_users: activeUsers,
            inactive_users: totalUsers - activeUsers,
            total_structures: totalStructures,
            new_users: newUsersInPeriod,
            new_structures: newStructuresInPeriod,
            total_entries: totalEntries,
            active_users_period: activeUsersInPeriod,
            period_days: parseInt(days)
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

// Statistiques dashboard admin
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('📊 getDashboardStats appelé avec query:', req.query);
        
        // Vérification des modèles essentiels
        if (!User || !Structure) {
            console.error('❌ Modèles User ou Structure manquants');
            return res.status(500).json({
                success: false,
                message: 'Erreur lors du chargement des statistiques dashboard',
                error: 'Modèles essentiels non disponibles'
            });
        }
        
        const { days = 7 } = req.query;
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const startDate = subDays(today, parseInt(days));

        console.log('📅 Calcul dashboard stats pour', days, 'jours depuis:', startDate);

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
                createdAt: { [Op.gte]: startDate }
            }
        });

        const newStructuresInPeriod = await Structure.count({
            where: {
                createdAt: { [Op.gte]: startDate }
            }
        });

        // Calculs avec TimeTracking (optionnels)
        let todayEntries = 0;
        let activeUsersToday = 0;

        if (TimeTracking) {
            try {
                todayEntries = await TimeTracking.count({
                    where: {
                        date_time: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });

                activeUsersToday = await TimeTracking.count({
                    distinct: true,
                    col: 'user_id',
                    where: {
                        date_time: { [Op.between]: [startOfToday, endOfToday] }
                    }
                });
            } catch (error) {
                console.warn('⚠️  Erreur TimeTracking dashboard:', error.message);
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
            period_days: parseInt(days),
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
            // Si TimeTracking n'existe pas, retourner un tableau vide
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'Aucune activité disponible (modèle TimeTracking non configuré)'
            });
        }        
        const { limit = 10 } = req.query;
        
        const activities = await TimeTracking.findAll({
            limit: parseInt(limit),
            order: [['date_time', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email'],
                    include: [
                        {
                            model: Structure,
                            as: 'structure',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Task,
                    as: 'task',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        console.error('Erreur getRecentActivity:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement de l\'activité récente',
            error: error.message
        });
    }
};

// ===== SYSTÈME ET AUDIT =====

// Santé du système
exports.getSystemHealth = async (req, res) => {
    try {
        const [userCount, structureCount, activeConnections] = await Promise.all([
            User.count(),
            Structure.count(),
            TimeTracking.count({
                where: {
                    date_time: {
                        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                status: 'healthy',
                database: 'connected',
                total_users: userCount,
                total_structures: structureCount,
                active_sessions_24h: activeConnections,
                uptime: process.uptime(),
                memory_usage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Erreur getSystemHealth:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification de la santé du système',
            data: {
                status: 'unhealthy',
                error: error.message
            }
        });
    }
};

// Logs d'audit système
exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, action, userId } = req.query;
        
        res.status(200).json({
            success: true,
            message: 'Fonctionnalité logs d\'audit en développement',
            data: []
        });
    } catch (error) {
        console.error('Erreur getAuditLogs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des logs',
            error: error.message
        });
    }
};
