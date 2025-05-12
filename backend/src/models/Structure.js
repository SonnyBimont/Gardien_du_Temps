module.exports = (sequelize, DataTypes) => {
    const Structure = sequelize.define('Structure', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        postal_code: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        school_vacation_zone: {
            type: DataTypes.ENUM('A', 'B', 'C'),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'structures',
        timestamps: true
    });

    Structure.associate = (models) => {
        // Structure has many Users
        Structure.hasMany(models.User, {
            foreignKey: 'structure_id',
            as: 'users'
        });

        // Structure has many Projects
        Structure.hasMany(models.Project, {
            foreignKey: 'structure_id',
            as: 'projects'
        });
    };

    return Structure;
};