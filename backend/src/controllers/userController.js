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
            includeInactive = false,
            structureId,
            role,
            search 
        } = req.query;

        const whereConditions = {};
        
        // Filtrage selon les permissions
        if (!includeInactive || req.user.role !== 'admin') {
            whereConditions.active = true;
        }
        
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

        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            where: whereConditions,
            include: [{ 
                model: Structure, 
                as: 'structure',
                attributes: ['id', 'name', 'city']
            }],
            order: [['createdAt', 'DESC']]
        });

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
        const updateData = { ...req.body };

        // Vérifications de permissions
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Vous ne pouvez modifier que votre propre profil' 
            });
        }

        if (updateData.role && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Seuls les administrateurs peuvent modifier les rôles' 
            });
        }

        // Hachage du mot de passe si fourni
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const [updated] = await User.update(updateData, {
            where: { id }
        });

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
            message: 'Utilisateur mis à jour avec succès',
            data: updatedUser
        });
    } catch (error) {
        console.error('Erreur updateUser:', error);
        res.status(400).json({ 
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur', 
            error: error.message 
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

// ===== STATISTIQUES ADMIN (FUSIONNÉES) =====

// Statistiques générales
exports.getStats = async (req, res) => {
    try {
    // Vérifier que les modèles sont disponibles
        if (!User || !Structure || !TimeTracking) {
            throw new Error('Modèles non disponibles');
        }

        const { days = 7 } = req.query;
        const startDate = subDays(new Date(), parseInt(days));

        const [
            totalUsers,
            activeUsers,
            totalEntries,
            activeUsersInPeriod,
            byRole,
            byStructure
        ] = await Promise.all([
            User.count({ where: { role: { [Op.ne]: 'admin' } } }),
            User.count({ where: { active: true, role: { [Op.ne]: 'admin' } } }),
            TimeTracking.count({
                where: { date_time: { [Op.gte]: startDate } }
            }),
            TimeTracking.count({
                distinct: true,
                col: 'user_id',
                where: { date_time: { [Op.gte]: startDate } }
            }),
            User.findAll({
                attributes: [
                    'role',
                    [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
                ],
                where: { role: { [Op.ne]: 'admin' } },
                group: ['role'],
                raw: true
            }),
            User.findAll({
                attributes: [
                    'structure_id',
                    [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
                ],
                include: [{
                    model: Structure,
                    as: 'structure',
                    attributes: ['name']
                }],
                where: { role: { [Op.ne]: 'admin' } },
                group: ['structure_id', 'structure.id', 'structure.name'],
                raw: true
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_users: totalUsers,
                active_users: activeUsers,
                inactive_users: totalUsers - activeUsers,
                total_entries: totalEntries,
                active_users_period: activeUsersInPeriod,
                period_days: parseInt(days),
                by_role: byRole.reduce((acc, item) => {
                    acc[item.role] = parseInt(item.count);
                    return acc;
                }, {}),
                by_structure: byStructure.map(item => ({
                    structure_id: item.structure_id,
                    structure_name: item['structure.name'],
                    count: parseInt(item.count)
                }))
            }
        });
    } catch (error) {
        console.error('Erreur getStats:', error);
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

        if (!User || !Structure || !TimeTracking) {
            throw new Error('Modèles non disponibles');
        }
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        const [
            totalUsers,
            activeUsers,
            totalStructures,
            todayEntries,
            activeUsersToday
        ] = await Promise.all([
            User.count({ where: { role: { [Op.ne]: 'admin' } } }),
            User.count({ where: { active: true, role: { [Op.ne]: 'admin' } } }),
            Structure.count(),
            TimeTracking.count({
                where: {
                    date_time: { [Op.between]: [startOfToday, endOfToday] }
                }
            }),
            TimeTracking.count({
                distinct: true,
                col: 'user_id',
                where: {
                    date_time: { [Op.between]: [startOfToday, endOfToday] }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_users: totalUsers,
                active_users: activeUsers,
                inactive_users: totalUsers - activeUsers,
                total_structures: totalStructures,
                today_entries: todayEntries,
                active_users_today: activeUsersToday,
                date: today.toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error('Erreur getDashboardStats:', error);
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
