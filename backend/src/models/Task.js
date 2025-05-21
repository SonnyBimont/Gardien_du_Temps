module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false
        },
        estimated_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('to_do', 'in_progress', 'completed'),
            allowNull: false
        },
        recurrence: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
            allowNull: false
        }
    }, {
        tableName: 'tasks',
        timestamps: true
    });

    Task.associate = (models) => {
        // Association avec Project
        Task.belongsTo(models.Project, {
            foreignKey: 'project_id',
            as: 'project'
        });

        // Association many-to-many avec User
        Task.belongsToMany(models.User, {
            through: 'User_Task',
            foreignKey: 'task_id',
            otherKey: 'user_id',
            as: 'assignedUsers'
        });
        // Dans la méthode associate du modèle Task
        Task.hasMany(models.Time_Tracking, {
            foreignKey: 'task_id',
            as: 'timeEntries'
        });
    };

    return Task;
};