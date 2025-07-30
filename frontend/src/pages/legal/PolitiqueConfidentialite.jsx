/**
 * POLITIQUE DE CONFIDENTIALITÉ - GARDIEN DU TEMPS
 * 
 * Conforme RGPD (Règlement Général sur la Protection des Données)
 * Articles 13 et 14 - Information des personnes concernées
 * 
 * Respect des obligations :
 * - Finalités du traitement
 * - Base juridique
 * - Durées de conservation
 * - Droits des personnes
 * - Mesures de sécurité
 * - Transferts de données
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Users, Clock } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link 
              to="/login" 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Politique de Confidentialité
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Sommaire RGPD */}
        <nav aria-label="Sommaire de la politique de confidentialité" className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Sommaire
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li><a href="#responsable" className="text-blue-700 hover:underline">Responsable du traitement</a></li>
                <li><a href="#donnees-collectees" className="text-blue-700 hover:underline">Données collectées</a></li>
                <li><a href="#finalites" className="text-blue-700 hover:underline">Finalités du traitement</a></li>
                <li><a href="#base-juridique" className="text-blue-700 hover:underline">Base juridique</a></li>
                <li><a href="#conservation" className="text-blue-700 hover:underline">Durée de conservation</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="#destinataires" className="text-blue-700 hover:underline">Destinataires des données</a></li>
                <li><a href="#droits" className="text-blue-700 hover:underline">Vos droits RGPD</a></li>
                <li><a href="#securite" className="text-blue-700 hover:underline">Sécurité des données</a></li>
                <li><a href="#cookies" className="text-blue-700 hover:underline">Cookies et traceurs</a></li>
                <li><a href="#contact" className="text-blue-700 hover:underline">Nous contacter</a></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              La présente politique de confidentialité vous informe sur la façon dont nous collectons, 
              utilisons et protégeons vos données personnelles dans le cadre de l'utilisation de 
              l'application "Gardien du Temps", conformément au Règlement Général sur la Protection 
              des Données (RGPD) et à la loi "Informatique et Libertés".
            </p>
          </div>

          {/* Responsable du traitement */}
          <section id="responsable" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Responsable du traitement
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="mb-4">
                Le responsable du traitement des données personnelles est :
              </p>
              <div className="space-y-2">
                <p><strong>Société :</strong> [Sanka Dev]</p>
                <p><strong>Adresse :</strong> [1 rue de Sanka Dev 59000 Lille]</p>
                <p><strong>Email :</strong> <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline">admin@gardien-temps.com</a></p>
                <p><strong>Téléphone :</strong> [01.02.03.04.05]</p>
                <p><strong>SIRET :</strong> [123.456.789.00]</p>
              </div>
            </div>
          </section>

          {/* Données collectées */}
          <section id="donnees-collectees" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Données personnelles collectées
            </h2>
            
            <h3 className="text-lg font-medium mb-3">Catégories de données traitées</h3>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 Données d'identification</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Nom et prénom</li>
                  <li>• Adresse email professionnelle</li>
                  <li>• Fonction et rôle dans la structure</li>
                  <li>• Structure d'affectation</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">⏰ Données de pointage</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Heures d'arrivée et de départ</li>
                  <li>• Durée et horaires des pauses</li>
                  <li>• Temps de travail effectué</li>
                  <li>• Commentaires sur les journées de travail</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📱 Données techniques</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Adresse IP de connexion</li>
                  <li>• Type de navigateur et version</li>
                  <li>• Dates et heures de connexion</li>
                  <li>• Pages consultées et actions effectuées</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📊 Données de performance</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Statistiques de temps de travail</li>
                  <li>• Objectifs et plannings</li>
                  <li>• Rapports d'activité</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalités */}
          <section id="finalites" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Finalités du traitement
            </h2>
            <p className="mb-4">Nous traitons vos données personnelles pour les finalités suivantes :</p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Gestion du temps de travail</h3>
                  <p className="text-sm text-gray-600">Enregistrement et suivi des heures de travail pour le calcul de la paie et le respect du droit du travail</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Administration RH</h3>
                  <p className="text-sm text-gray-600">Gestion des plannings, congés, formation et suivi administratif des employés</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sécurité et authentification</h3>
                  <p className="text-sm text-gray-600">Sécurisation de l'accès à l'application et protection contre les utilisations frauduleuses</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Amélioration du service</h3>
                  <p className="text-sm text-gray-600">Analyse d'usage pour améliorer les fonctionnalités et l'ergonomie de l'application</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Obligations légales</h3>
                  <p className="text-sm text-gray-600">Respect des obligations légales en matière de durée du travail, archives sociales et contrôles</p>
                </div>
              </div>
            </div>
          </section>

          {/* Base juridique */}
          <section id="base-juridique" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Base juridique du traitement
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Exécution du contrat de travail</h3>
                <p className="text-sm text-green-700">
                  Le traitement de vos données de pointage est nécessaire à l'exécution de votre contrat de travail 
                  (Article 6.1.b du RGPD)
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">⚖️ Respect d'obligations légales</h3>
                <p className="text-sm text-blue-700">
                  Le traitement est nécessaire au respect des obligations légales en matière de droit du travail 
                  (Article 6.1.c du RGPD)
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">🎯 Intérêts légitimes</h3>
                <p className="text-sm text-yellow-700">
                  L'amélioration du service et la sécurisation de l'accès reposent sur nos intérêts légitimes 
                  (Article 6.1.f du RGPD)
                </p>
              </div>
            </div>
          </section>

          {/* Conservation */}
          <section id="conservation" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Durée de conservation des données
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de données
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durée de conservation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base légale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Données de pointage
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      5 ans après la fin du contrat
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Code du travail (archives sociales)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Données de connexion
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      1 an
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Loi pour la confiance dans l'économie numérique
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Comptes utilisateurs inactifs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      3 ans sans connexion
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Intérêt légitime (sécurité)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Cookies techniques
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      13 mois maximum
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Recommandation CNIL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Destinataires */}
          <section id="destinataires" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Destinataires des données
            </h2>
            
            <p className="mb-4">Vos données personnelles sont accessibles aux personnes suivantes :</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">🏢 Personnel autorisé de votre structure</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Directeur, responsable RH et personnel administratif habilité pour la gestion des plannings et de la paie
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900">🔧 Équipe technique</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Administrateurs système et développeurs, uniquement pour la maintenance et le support technique
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-medium text-gray-900">⚖️ Autorités compétentes</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Uniquement sur demande légale : inspection du travail, URSSAF, tribunaux
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">🚫 Pas de transfert commercial</h3>
              <p className="text-sm text-red-700">
                Vos données ne sont jamais vendues, louées ou transmises à des fins commerciales à des tiers.
              </p>
            </div>
          </section>

          {/* Droits RGPD */}
          <section id="droits" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Vos droits sur vos données personnelles
            </h2>
            
            <p className="mb-6">
              Conformément au RGPD, vous disposez des droits suivants que vous pouvez exercer 
              en nous contactant à <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline">admin@gardien-temps.com</a> :
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">👁️ Droit d'accès</h3>
                  <p className="text-sm text-blue-700">
                    Obtenir une copie de toutes vos données personnelles que nous détenons
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">✏️ Droit de rectification</h3>
                  <p className="text-sm text-green-700">
                    Corriger ou mettre à jour vos données personnelles inexactes ou incomplètes
                  </p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">🗑️ Droit à l'effacement</h3>
                  <p className="text-sm text-red-700">
                    Demander la suppression de vos données (sauf obligations légales de conservation)
                  </p>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">⏸️ Droit à la limitation</h3>
                  <p className="text-sm text-yellow-700">
                    Suspendre temporairement le traitement de vos données dans certains cas
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">📦 Droit à la portabilité</h3>
                  <p className="text-sm text-purple-700">
                    Récupérer vos données dans un format structuré et lisible par machine
                  </p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">❌ Droit d'opposition</h3>
                  <p className="text-sm text-orange-700">
                    Vous opposer au traitement de vos données pour des raisons légitimes
                  </p>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-medium text-indigo-900 mb-2">⚖️ Droit de réclamation</h3>
                  <p className="text-sm text-indigo-700">
                    Déposer une plainte auprès de la CNIL si vous estimez que vos droits ne sont pas respectés
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">📋 Directives post-mortem</h3>
                  <p className="text-sm text-gray-700">
                    Définir des directives sur le sort de vos données après votre décès
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">⏱️ Délai de réponse</h3>
              <p className="text-sm text-blue-700">
                Nous nous engageons à répondre à vos demandes dans un délai d'un mois maximum. 
                Ce délai peut être prolongé de deux mois supplémentaires pour les demandes complexes.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section id="securite" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" />
              Sécurité et protection des données
            </h2>
            
            <p className="mb-6">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
              pour assurer la sécurité de vos données personnelles :
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">🔐 Mesures techniques</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Chiffrement des données sensibles (AES-256)</li>
                  <li>• Authentification multi-facteurs disponible</li>
                  <li>• Protection contre les attaques par force brute</li>
                  <li>• Transmission sécurisée (HTTPS/TLS 1.3)</li>
                  <li>• Sauvegarde chiffrée et redondante</li>
                  <li>• Surveillance continue des accès</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">👥 Mesures organisationnelles</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Accès aux données sur principe du besoin d'en connaître</li>
                  <li>• Formation régulière du personnel à la sécurité</li>
                  <li>• Audits de sécurité réguliers</li>
                  <li>• Procédures de gestion des incidents</li>
                  <li>• Clauses de confidentialité pour tous les employés</li>
                  <li>• Analyse d'impact sur la protection des données (AIPD)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">🇪🇺 Hébergement européen</h3>
              <p className="text-sm text-green-700">
                Vos données sont hébergées exclusivement sur des serveurs situés dans l'Union européenne, 
                garantissant le respect du RGPD.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cookies et technologies similaires
            </h2>
            
            <p className="mb-4">
              Notre application utilise des cookies et technologies similaires. 
              Pour plus d'informations, consultez notre 
              <Link to="/legal/cookie-policy" className="text-blue-600 hover:underline">
                Politique des cookies
              </Link>.
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🍪 Cookies strictement nécessaires</h3>
                <p className="text-sm text-gray-600">
                  Indispensables au fonctionnement de l'application (session, authentification, sécurité). 
                  Ces cookies ne nécessitent pas de consentement.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📊 Cookies de performance</h3>
                <p className="text-sm text-gray-600">
                  Collecte d'informations anonymes sur l'utilisation de l'application pour améliorer ses performances. 
                  Votre consentement est requis.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Nous contacter - Questions sur vos données
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-medium text-blue-900 mb-4">📧 Délégué à la Protection des Données (Admin)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email :</strong> <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline">admin@gardien-temps.com</a></p>
                  <p><strong>Courrier :</strong></p>
                  <p className="ml-4">
                    Sanka Dev - Gardien du Temps<br/>
                    [1 rue de Sanka Dev]<br/>
                    [59000] [Lille]
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">⚖️ Commission Nationale de l'Informatique et des Libertés</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>En cas de litige, vous pouvez saisir la CNIL :</p>
                  <p><strong>Site web :</strong> <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a></p>
                  <p><strong>Adresse :</strong></p>
                  <p className="ml-4">
                    CNIL<br/>
                    3 Place de Fontenoy<br/>
                    TSA 80715<br/>
                    75334 PARIS CEDEX 07
                  </p>
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
            <Link to="/legal/legal-notices" className="hover:text-blue-600 transition-colors">
              Mentions légales
            </Link>
            {" - "}
            <Link to="/legal/cookie-policy" className="hover:text-blue-600 transition-colors">
              Politique des Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;