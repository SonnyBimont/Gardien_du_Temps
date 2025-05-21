// Dans votre contrôleur, avant d'envoyer la réponse
const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Convertit en YYYY-MM-DD
};

// Formater les dates pour chaque utilisateur
const formattedUsers = users.map(user => ({
    ...user,
    contract_start_date: formatDate(user.contract_start_date),
    contract_end_date: formatDate(user.contract_end_date),
    createdAt: formatDate(user.createdAt),
    updatedAt: formatDate(user.updatedAt)
}));

// Envoyer la réponse avec les dates formatées
res.status(200).json({
    success: true,
    count: users.length,
    data: formattedUsers
});