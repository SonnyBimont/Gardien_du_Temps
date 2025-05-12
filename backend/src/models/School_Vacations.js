module.exports = (sequelize, DataTypes) => {
    const School_Vacations = sequelize.define('School_Vacations', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        zone: {
            type: DataTypes.ENUM('A', 'B', 'C'),
            allowNull: false
        },
        period_name: {
            type: DataTypes.STRING(255),
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
        school_year: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'school_vacations',
        timestamps: true
    });

    // No associations needed for School_Vacations

    return School_Vacations;
};