module.exports = (sequelize, DataTypes) => {
    const Activity_Log = sequelize.define('Activity_Log', {
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
        action_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        action_type: {
            type: DataTypes.ENUM('login', 'creation', 'modification', 'deletion'),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        ip_address: {
            type: DataTypes.STRING(25),
            allowNull: true
        }
    }, {
        tableName: 'activity_logs',
        timestamps: true
    });

    Activity_Log.associate = (models) => {
        // ActivityLog belongs to User
        Activity_Log.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return Activity_Log;
};