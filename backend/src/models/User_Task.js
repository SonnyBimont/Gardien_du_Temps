module.exports = (sequelize, DataTypes) => {
    const User_Task = sequelize.define('User_Task', {
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
            allowNull: false
        },
        time_worked: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        work_date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'user_tasks',
        timestamps: true
    });

    User_Task.associate = (models) => {
        // UserTask belongs to User
        User_Task.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // UserTask belongs to Task
        User_Task.belongsTo(models.Task, {
            foreignKey: 'task_id',
            as: 'task'
        });
    };

    return User_Task;
};