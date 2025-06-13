module.exports = (sequelize, DataTypes) => {
    const Hour_Planning = sequelize.define('Hour_Planning', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        plan_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: 'Date de planification au format YYYY-MM-DD'
        },
        planned_hours: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0,
                max: 24
            }
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Projects',
                key: 'id'
            }
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#3B82F6',
            validate: {
                is: /^#[0-9A-F]{6}$/i // Validation couleur hex
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'hour_planning',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'plan_date'],
                name: 'unique_user_date'
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['plan_date']
            },
            {
                fields: ['project_id']
            }
        ]
    });

    Hour_Planning.associate = (models) => {
        // Hour_Planning belongs to User
        Hour_Planning.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Hour_Planning belongs to Project (optionnel)
        Hour_Planning.belongsTo(models.Project, {
            foreignKey: 'project_id',
            as: 'project'
        });
    };

    return Hour_Planning;
};