module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        structure_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'director', 'animator'),
            allowNull: false
        },
        contract_type: {
            type: DataTypes.ENUM('permanent', 'fixed_term', 'etc.'),
            allowNull: false
        },
        weekly_hours: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        annual_hours: {
            type: DataTypes.DECIMAL,
            allowNull: true
        },
        contract_start_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        contract_end_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    User.associate = (models) => {
        // Association avec Structure
        User.belongsTo(models.Structure, {
            foreignKey: 'structure_id',
            as: 'structure'
        });

        // User has many TimeTrackings
        User.hasMany(models.Time_Tracking, {
            foreignKey: 'user_id',
            as: 'time_trackings'
        });

        // User has many PlannedSchedules
        User.hasMany(models.Planned_Schedule, {
            foreignKey: 'user_id',
            as: 'planned_schedules'
        });

        // Association many-to-many avec Task
        User.belongsToMany(models.Task, {
            through: 'User_Task',
            foreignKey: 'user_id',
            otherKey: 'task_id',
            as: 'assignedTasks'
        });

        // User has many ActivityLogs
        User.hasMany(models.Activity_Log, {
            foreignKey: 'user_id',
            as: 'activity_logs'
        });

        // User validates many TimeTrackings
        User.hasMany(models.Time_Tracking, {
            foreignKey: 'validated_by',
            as: 'validated_time_trackings'
        });
    };

    return User;
};