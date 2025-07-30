/**
 * POLITIQUE DES COOKIES - GARDIEN DU TEMPS
 * 
 * Conforme RGPD et recommandations CNIL
 * Directive ePrivacy - Loi Informatique et Libertés
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, CheckCircle, XCircle, Info } from 'lucide-react';

const CookiePolicy = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // toujours activé
    functional: false,
    analytics: false,
    marketing: false
  });

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // ne peut pas être désactivé
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // Simulation de sauvegarde des préférences
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Préférences sauvegardées !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link 
              to="/login" 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Retour à la page de connexion"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Link>
            <div className="flex items-center space-x-2">
              <Cookie className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Politique des Cookies
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Gestion des préférences - En haut pour l'accessibilité */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Gérer mes préférences cookies
          </h2>
          
          <div className="space-y-4">
            {/* Cookies nécessaires */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">🔒 Cookies strictement nécessaires</h3>
                <p className="text-sm text-gray-600">
                  Indispensables au fonctionnement de l'application (session, sécurité)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Toujours actifs</span>
              </div>
            </div>
            
            {/* Cookies fonctionnels */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">⚙️ Cookies de fonctionnalité</h3>
                <p className="text-sm text-gray-600">
                  Mémorisation de vos préférences (thème, langue, mise en page)
                </p>
              </div>
              <button
                onClick={() => handlePreferenceChange('functional')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  cookiePreferences.functional ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cookiePreferences.functional ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Cookies analytiques */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">📊 Cookies d'analyse</h3>
                <p className="text-sm text-gray-600">
                  Statistiques d'usage anonymes pour améliorer l'application
                </p>
              </div>
              <button
                onClick={() => handlePreferenceChange('analytics')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  cookiePreferences.analytics ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cookiePreferences.analytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={savePreferences}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sauvegarder mes préférences
              </button>
            </div>
          </div>
        </div>

        {/* Sommaire */}
        <nav aria-label="Sommaire de la politique des cookies" className="mb-8">
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Sommaire
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li><a href="#definition" className="text-blue-600 hover:text-blue-700 hover:underline">Qu'est-ce qu'un cookie ?</a></li>
                <li><a href="#types-cookies" className="text-blue-600 hover:text-blue-700 hover:underline">Types de cookies utilisés</a></li>
                <li><a href="#finalites" className="text-blue-600 hover:text-blue-700 hover:underline">Finalités et durées</a></li>
                <li><a href="#base-legale" className="text-blue-600 hover:text-blue-700 hover:underline">Base légale</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="#gestion" className="text-blue-600 hover:text-blue-700 hover:underline">Gérer vos cookies</a></li>
                <li><a href="#navigateur" className="text-blue-600 hover:text-blue-700 hover:underline">Paramètres navigateur</a></li>
                <li><a href="#consequences" className="text-blue-600 hover:text-blue-700 hover:underline">Conséquences du refus</a></li>
                <li><a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline">Nous contacter</a></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Cookie className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Cette politique vous informe sur l'utilisation des cookies et technologies similaires 
              sur l'application "Gardien du Temps", conformément au Règlement Général sur la Protection 
              des Données (RGPD) et aux recommandations de la CNIL.
            </p>
          </div>

          {/* Définition */}
          <section id="definition" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Qu'est-ce qu'un cookie ?
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-blue-800 mb-4">
                Un cookie est un petit fichier de données qui est stocké sur votre appareil 
                (ordinateur, téléphone, tablette) lorsque vous visitez un site web ou utilisez une application.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">🎯 Utilité des cookies</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Mémoriser vos préférences</li>
                    <li>• Maintenir votre session de connexion</li>
                    <li>• Améliorer la sécurité</li>
                    <li>• Personnaliser votre expérience</li>
                    <li>• Analyser l'usage de l'application</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">📱 Technologies concernées</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Cookies HTTP</li>
                    <li>• Local Storage</li>
                    <li>• Session Storage</li>
                    <li>• IndexedDB</li>
                    <li>• Web beacons</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Types de cookies */}
          <section id="types-cookies" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Types de cookies utilisés
            </h2>
            
            <div className="space-y-6">
              {/* Cookies nécessaires */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  🍪 Cookies strictement nécessaires
                </h3>
                <p className="text-green-800 mb-4">
                  Ces cookies sont indispensables au fonctionnement de l'application. 
                  Ils ne nécessitent pas de consentement selon l'article 82 de la loi Informatique et Libertés.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg border border-green-200">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-green-900">Nom</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-green-900">Finalité</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-green-900">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-green-800 font-mono">auth_token</td>
                        <td className="px-4 py-2 text-sm text-green-700">Authentification utilisateur</td>
                        <td className="px-4 py-2 text-sm text-green-700">Session</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-green-800 font-mono">csrf_token</td>
                        <td className="px-4 py-2 text-sm text-green-700">Protection contre les attaques CSRF</td>
                        <td className="px-4 py-2 text-sm text-green-700">Session</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-green-800 font-mono">session_id</td>
                        <td className="px-4 py-2 text-sm text-green-700">Maintien de la session utilisateur</td>
                        <td className="px-4 py-2 text-sm text-green-700">30 minutes</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-green-800 font-mono">security_check</td>
                        <td className="px-4 py-2 text-sm text-green-700">Vérifications de sécurité</td>
                        <td className="px-4 py-2 text-sm text-green-700">24 heures</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Cookies fonctionnels */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  ⚙️ Cookies de fonctionnalité
                </h3>
                <p className="text-blue-800 mb-4">
                  Ces cookies améliorent votre expérience en mémorisant vos préférences. 
                  Votre consentement est requis.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg border border-blue-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-blue-900">Nom</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-blue-900">Finalité</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-blue-900">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-blue-800 font-mono">theme_preference</td>
                        <td className="px-4 py-2 text-sm text-blue-700">Thème sombre/clair choisi</td>
                        <td className="px-4 py-2 text-sm text-blue-700">1 an</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-blue-800 font-mono">language_pref</td>
                        <td className="px-4 py-2 text-sm text-blue-700">Langue préférée</td>
                        <td className="px-4 py-2 text-sm text-blue-700">1 an</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-blue-800 font-mono">dashboard_layout</td>
                        <td className="px-4 py-2 text-sm text-blue-700">Personnalisation interface</td>
                        <td className="px-4 py-2 text-sm text-blue-700">6 mois</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-blue-800 font-mono">remember_email</td>
                        <td className="px-4 py-2 text-sm text-blue-700">Email mémorisé si demandé</td>
                        <td className="px-4 py-2 text-sm text-blue-700">30 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Cookies analytiques */}
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <h3 className="font-medium text-purple-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  📊 Cookies d'analyse et de performance
                </h3>
                <p className="text-purple-800 mb-4">
                  Ces cookies collectent des informations anonymes sur l'utilisation de l'application. 
                  Votre consentement est requis.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg border border-purple-200">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-purple-900">Nom</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-purple-900">Finalité</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-purple-900">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-purple-800 font-mono">analytics_id</td>
                        <td className="px-4 py-2 text-sm text-purple-700">Identifiant anonyme de session</td>
                        <td className="px-4 py-2 text-sm text-purple-700">2 ans</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-purple-800 font-mono">usage_stats</td>
                        <td className="px-4 py-2 text-sm text-purple-700">Statistiques d'utilisation</td>
                        <td className="px-4 py-2 text-sm text-purple-700">13 mois</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-purple-800 font-mono">performance_metrics</td>
                        <td className="px-4 py-2 text-sm text-purple-700">Mesures de performance</td>
                        <td className="px-4 py-2 text-sm text-purple-700">6 mois</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Base légale */}
          <section id="base-legale" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Base légale et conformité
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Cookies exemptés de consentement</h3>
                <p className="text-sm text-green-700">
                  <strong>Article 82 de la loi Informatique et Libertés :</strong> 
                  Les cookies strictement nécessaires au fonctionnement du service demandé 
                  par l'utilisateur sont exemptés de consentement.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🔔 Cookies nécessitant un consentement</h3>
                <p className="text-sm text-blue-700">
                  <strong>RGPD Article 6.1.a :</strong> 
                  Les cookies de fonctionnalité et d'analyse nécessitent votre consentement libre, 
                  éclairé, spécifique et univoque.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">⏳ Durée de conservation</h3>
                <p className="text-sm text-yellow-700">
                  <strong>Recommandation CNIL :</strong> 
                  Les cookies sont conservés pour une durée maximale de 13 mois, 
                  sauf cookies de session supprimés à la fermeture du navigateur.
                </p>
              </div>
            </div>
          </section>

          {/* Gestion navigateur */}
          <section id="navigateur" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Paramétrer votre navigateur
            </h2>
            
            <p className="text-gray-700 mb-6">
              Vous pouvez configurer votre navigateur pour gérer les cookies selon vos préférences :
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">🌐 Google Chrome</h3>
                  <p className="text-sm text-blue-700 mb-2">Paramètres → Confidentialité et sécurité → Cookies</p>
                  <a 
                    href="https://support.google.com/chrome/answer/95647" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Guide détaillé →
                  </a>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="font-medium text-orange-900 mb-2">🦊 Mozilla Firefox</h3>
                  <p className="text-sm text-orange-700 mb-2">Paramètres → Vie privée et sécurité → Cookies</p>
                  <a 
                    href="https://support.mozilla.org/fr/kb/cookies-informations-sites-web-stockent-ordinateur" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline text-sm"
                  >
                    Guide détaillé →
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">🧭 Safari</h3>
                  <p className="text-sm text-gray-700 mb-2">Préférences → Confidentialité → Cookies</p>
                  <a 
                    href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline text-sm"
                  >
                    Guide détaillé →
                  </a>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">⚡ Microsoft Edge</h3>
                  <p className="text-sm text-blue-700 mb-2">Paramètres → Cookies et autorisations de site</p>
                  <a 
                    href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Guide détaillé →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Conséquences */}
          <section id="consequences" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Conséquences du refus des cookies
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">🚫 Refus des cookies nécessaires</h3>
                <p className="text-sm text-red-700">
                  Impossible, car ces cookies sont indispensables au fonctionnement de l'application. 
                  Sans eux, vous ne pourrez pas vous connecter ni utiliser les fonctionnalités.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">⚠️ Refus des cookies fonctionnels</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Vos préférences ne seront pas mémorisées</li>
                  <li>• Interface par défaut à chaque connexion</li>
                  <li>• Pas de personnalisation possible</li>
                  <li>• Email non mémorisé sur la page de connexion</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📊 Refus des cookies d'analyse</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pas d'impact sur votre utilisation</li>
                  <li>• Nous ne pourrons pas améliorer l'application selon vos usages</li>
                  <li>• Pas de statistiques personnalisées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Questions sur les cookies
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-blue-800 mb-4">
                Pour toute question concernant notre utilisation des cookies :
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Cookie className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Email</p>
                    <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline">
                      admin@gardien-temps.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Objet suggéré</p>
                    <p className="text-blue-700">"Question - Politique des cookies"</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="/legal/terms-of-service" className="hover:text-blue-600 transition-colors">
              Conditions d'utilisation
            </Link>
            {" - "}
            <Link to="/legal/privacy-policy" className="hover:text-blue-600 transition-colors">
              Politique de confidentialité
            </Link>
            {" - "}
            <Link to="/legal/legal-notices" className="hover:text-blue-600 transition-colors">
              Mentions légales
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Sanka Dev - Gardien du Temps. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;