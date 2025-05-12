module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        structure_id: {
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
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('in_preparation', 'in_progress', 'completed'),
            allowNull: false
        }
    }, {
        tableName: 'projects',
        timestamps: true
    });

    Project.associate = (models) => {
        // Project belongs to Structure
        Project.belongsTo(models.Structure, {
            foreignKey: 'structure_id',
            as: 'structure'
        });

        // Project has many Tasks
        Project.hasMany(models.Task, {
            foreignKey: 'project_id',
            as: 'tasks'
        });
    };

    return Project;
};