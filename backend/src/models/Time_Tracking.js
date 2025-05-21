module.exports = (sequelize, DataTypes) => {
    const Time_Tracking = sequelize.define('Time_Tracking', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        task_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        date_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        tracking_type: {
            type: DataTypes.ENUM('arrival', 'break_start', 'break_end', 'departure'),
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        validated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'time_trackings',
        timestamps: true
    });

    Time_Tracking.associate = (models) => {
        // TimeTracking belongs to User
        Time_Tracking.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // TimeTracking is validated by User
        Time_Tracking.belongsTo(models.User, {
            foreignKey: 'validated_by',
            as: 'validator'
        });
        // Ajout de l'association avec Task
        Time_Tracking.belongsTo(models.Task, {
            foreignKey: 'task_id',
            as: 'task'
        });
    };

    return Time_Tracking;
};