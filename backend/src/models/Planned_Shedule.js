module.exports = (sequelize, DataTypes) => {
    const Planned_Schedule = sequelize.define('Planned_Schedule', {
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
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        break_start: {
            type: DataTypes.DATE,
            allowNull: true
        },
        break_end: {
            type: DataTypes.DATE,
            allowNull: true
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_template: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'planned_schedules',
        timestamps: true
    });

    Planned_Schedule.associate = (models) => {
        // PlannedSchedule belongs to User
        Planned_Schedule.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return Planned_Schedule;
};