// src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, Users, Target } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Pointage simplifié",
      description: "Enregistrez vos heures d'arrivée, pauses et départ en un clic"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Gestion de projets",
      description: "Organisez et suivez l'avancement de vos projets en équipe"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Travail collaboratif",
      description: "Coordonnez les tâches et communiquez avec votre équipe"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Données sécurisées",
      description: "Vos informations sont protégées et sauvegardées en temps réel"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Panneau gauche - Informations */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="flex flex-col justify-center px-12 py-16">
            {/* Logo et titre */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Gardien du Temps</h1>
                  <p className="text-blue-100">Gestion de temps moderne</p>
                </div>
              </div>
              <p className="text-xl text-blue-100 leading-relaxed">
                La solution complète pour gérer le temps de travail de votre équipe, 
                organiser vos projets et optimiser votre productivité.
              </p>
            </div>

            {/* Fonctionnalités */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistiques fictives */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-blue-400 border-opacity-30">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-blue-200">Structures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-blue-200">Disponibilité</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau droit - Formulaire de connexion */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Gardien du Temps</h1>
              </div>
              <p className="text-gray-600">Connectez-vous à votre espace</p>
            </div>

            {/* Titre de connexion */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600">Accédez à votre espace de travail</p>
            </div>

            {/* Formulaire */}
            <LoginForm />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Besoin d'aide ? Contactez votre administrateur</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p>&copy; 2024 Gardien du Temps. Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;