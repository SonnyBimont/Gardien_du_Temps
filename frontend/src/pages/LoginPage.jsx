/**
 * ===== LOGIN PAGE - PAGE DE CONNEXION =====
 * 
 * Page d'accueil avec formulaire de connexion et présentation de l'application.
 * Design responsive avec panneau d'informations sur desktop et version simplifiée mobile.
 * 
 * FONCTIONNALITÉS :
 * - Design split-screen avec gradient animé sur desktop
 * - Présentation des fonctionnalités principales de l'app
 * - Redirection automatique si déjà connecté
 * - Interface responsive (mobile/desktop)
 * - Intégration du composant LoginForm
 * 
 * BONNES PRATIQUES OBSERVÉES :
 * - Redirection automatique des utilisateurs connectés
 * - Design moderne avec gradients et animations CSS
 * - Structure responsive bien pensée
 * - Séparation claire entre présentation et formulaire
 * - Accessibilité avec descriptions et icônes explicites
 * 
 * POINTS D'ATTENTION :
 * - Texte marketing dupliqué entre mobile et desktop
 * - Effet de background pourrait être un composant séparé
 * - Copyright hardcodé (pourrait être dynamique)
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, Users, Target } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Pointage simplifié",
      description: "Enregistrez vos heures d'arrivée, pauses et départ en un clic"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Gestion de projets", 
      description: "Organisez et suivez l'avancement de vos projets en équipe"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Travail collaboratif",
      description: "Coordonnez les tâches et communiquez avec votre équipe"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Données sécurisées",
      description: "Vos informations sont protégées et sauvegardées"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* 🖥️ Panneau gauche - Desktop uniquement */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-white bg-opacity-5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center min-h-full px-12 py-16">
            
            {/* 🏷️ Logo et titre principal */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Gardien du Temps</h1>
                  <p className="text-blue-100 text-base font-medium">Gestion de temps moderne</p>
                </div>
              </div>
              
              <p className="text-xl text-blue-50 leading-relaxed max-w-lg">
                La solution complète pour gérer le temps de travail de votre équipe, 
                organiser vos projets et optimiser votre productivité.
              </p>
            </div>
          </div>
        </div>

        {/* 🔐 Section formulaire de connexion */}
        <div className="flex-1 lg:w-2/5 bg-white flex items-center justify-center">
          <div className="w-full max-w-md px-6 py-8 lg:px-8 lg:py-12">   
            {/* 🎯 Titre de connexion */}
            <div className="text-center mb-8">
              {/* 📱 Logo et titre */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-3 lg:mr-4">
                  <Clock className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gardien du Temps</h1>
                  <p className="text-sm lg:text-base font-semibold text-gray-600">Gestion de temps moderne</p>
                </div>
              </div>
              
              <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                La solution complète pour gérer le temps de travail de votre équipe, 
                organiser vos projets et optimiser votre productivité.
              </p>
            </div>

            {/* 🚀 Fonctionnalités */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📝 Formulaire */}
            <div className="mb-8">
              <LoginForm />
            </div>

            {/* 🆘 Aide et footer */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Besoin d'aide ?</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Contactez votre administrateur
                </button>
              </div>
              
              <div className="pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">
                  &copy; 2025 Gardien du Temps by Sanka. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;