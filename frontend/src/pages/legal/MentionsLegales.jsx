/**
 * MENTIONS LÉGALES - GARDIEN DU TEMPS
 * 
 * Conforme à la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique
 * Obligations d'informations pour les éditeurs de sites web et applications
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Building, User, Globe, Shield, Phone, Mail } from 'lucide-react';

const LegalNotices = () => {
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
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Mentions Légales
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Sommaire */}
        <nav aria-label="Sommaire des mentions légales" className="mb-8">
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Sommaire
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li><a href="#editeur" className="text-blue-600 hover:text-blue-700 hover:underline">Éditeur de l'application</a></li>
                <li><a href="#directeur-publication" className="text-blue-600 hover:text-blue-700 hover:underline">Directeur de publication</a></li>
                <li><a href="#hebergement" className="text-blue-600 hover:text-blue-700 hover:underline">Hébergement</a></li>
                <li><a href="#propriete-intellectuelle" className="text-blue-600 hover:text-blue-700 hover:underline">Propriété intellectuelle</a></li>
              </ul>
              <ul className="space-y-2">
                <li><a href="#donnees-personnelles" className="text-blue-600 hover:text-blue-700 hover:underline">Données personnelles</a></li>
                <li><a href="#responsabilite" className="text-blue-600 hover:text-blue-700 hover:underline">Responsabilité</a></li>
                <li><a href="#droit-applicable" className="text-blue-600 hover:text-blue-700 hover:underline">Droit applicable</a></li>
                <li><a href="#contact" className="text-blue-600 hover:text-blue-700 hover:underline">Contact</a></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance 
              en l'économie numérique, nous vous informons des mentions légales relatives à l'application 
              "Gardien du Temps".
            </p>
          </div>

          {/* Éditeur */}
          <section id="editeur" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Éditeur de l'application
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Raison sociale</p>
                      <p className="text-blue-800">Sanka Dev</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Forme juridique</p>
                      <p className="text-blue-800">Auto-entrepreneur</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Siège social</p>
                      <p className="text-blue-800">
                        1 rue de Sanka Dev<br />
                        59000 Lille<br />
                        France
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">SIRET</p>
                      <p className="text-blue-800">123 456 789 00012</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Téléphone</p>
                      <p className="text-blue-800">01.02.03.04.05</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Email</p>
                      <p className="text-blue-800">
                        <a href="mailto:admin@gardien-temps.com" className="hover:underline">
                          admin@gardien-temps.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Numéro TVA intracommunautaire</p>
                    <p className="text-blue-800">FR32123456789</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Directeur de publication */}
          <section id="directeur-publication" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Directeur de publication
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Le directeur de publication de l'application "Gardien du Temps" est :
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sanka</p>
                    <p className="text-sm text-gray-600">Développeur et gérant</p>
                    <p className="text-sm text-gray-600">
                      <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline">
                        admin@gardien-temps.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Responsabilité :</strong> Le directeur de publication est responsable 
                  du contenu éditorial de l'application et de sa conformité aux lois en vigueur.
                </p>
              </div>
            </div>
          </section>

          {/* Hébergement */}
          <section id="hebergement" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              Hébergement de l'application
            </h2>
            
            <div className="space-y-6">
              <div class="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-medium text-green-900 mb-4">🖥️ Hébergeur principal</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Société :</strong> OVHcloud</p>
                    <p><strong>Forme juridique :</strong> SAS</p>
                    <p><strong>Capital social :</strong> 10 069 020 €</p>
                    <p><strong>RCS :</strong> Lille Métropole 424 761 419</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Siège social :</strong></p>
                    <p className="ml-4">
                      2 rue Kellermann<br />
                      59100 Roubaix<br />
                      France
                    </p>
                    <p><strong>Téléphone :</strong> 1007</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-4">🗄️ Base de données</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Hébergeur :</strong> OVHcloud (serveurs dédiés)</p>
                  <p><strong>Localisation :</strong> Centre de données Gravelines, France</p>
                  <p><strong>Certification :</strong> ISO 27001, SOC 2</p>
                  <p><strong>Sauvegarde :</strong> Quotidienne, chiffrée, multi-sites</p>
                </div>
              </div>
              
              <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-medium text-amber-900 mb-2">🇪🇺 Conformité RGPD</h3>
                <p className="text-sm text-amber-800">
                  Tous les serveurs sont situés dans l'Union européenne, garantissant 
                  la conformité au Règlement Général sur la Protection des Données.
                </p>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section id="propriete-intellectuelle" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Propriété intellectuelle
            </h2>
            
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h3 className="font-medium text-purple-900 mb-4">© Droits d'auteur</h3>
                <p className="text-purple-800 mb-4">
                  L'ensemble du contenu de l'application "Gardien du Temps" est protégé par les 
                  droits de propriété intellectuelle et appartient exclusivement à Sanka Dev ou à ses partenaires.
                </p>
                
                <div className="space-y-3 text-sm text-purple-700">
                  <p><strong>Sont notamment protégés :</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Le code source de l'application</li>
                    <li>L'interface utilisateur et le design</li>
                    <li>Les textes et contenus éditoriaux</li>
                    <li>Les logos, marques et éléments graphiques</li>
                    <li>La base de données et sa structure</li>
                    <li>Les algorithmes et fonctionnalités</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h3 className="font-medium text-red-900 mb-4">🚫 Interdictions</h3>
                <p className="text-red-800 mb-4">
                  Toute reproduction, représentation, modification, publication, adaptation 
                  de tout ou partie des éléments de l'application est strictement interdite, 
                  sauf autorisation écrite préalable de Sanka Dev.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Sanctions :</strong> La violation des droits de propriété intellectuelle 
                    constitue une contrefaçon passible de sanctions civiles et pénales 
                    (jusqu'à 300 000 € d'amende et 3 ans d'emprisonnement).
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-medium text-green-900 mb-4">✅ Utilisations autorisées</h3>
                <p className="text-green-800 mb-3">
                  Dans le cadre de l'utilisation normale de l'application, vous êtes autorisé à :
                </p>
                <ul className="text-sm text-green-700 list-disc list-inside space-y-1 ml-4">
                  <li>Consulter et utiliser l'application selon les CGU</li>
                  <li>Imprimer des rapports pour votre usage professionnel</li>
                  <li>Effectuer des captures d'écran à des fins documentaires internes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Données personnelles */}
          <section id="donnees-personnelles" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Protection des données personnelles
            </h2>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-blue-800 mb-4">
                La collecte et le traitement de vos données personnelles sont régis par notre 
                politique de confidentialité, conforme au RGPD et à la loi "Informatique et Libertés".
              </p>
              
              <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Politique de confidentialité</p>
                    <p className="text-sm text-gray-600">Informations complètes sur vos données</p>
                  </div>
                </div>
                <Link 
                  to="/legal/privacy-policy" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Consulter
                </Link>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-blue-700">
                <p><strong>Responsable du traitement :</strong> Sanka Dev</p>
                <p><strong>Admin :</strong> admin@gardien-temps.com</p>
                <p><strong>Finalités :</strong> Gestion du temps de travail, administration RH</p>
                <p><strong>Base juridique :</strong> Exécution du contrat de travail, obligations légales</p>
              </div>
            </div>
          </section>

          {/* Responsabilité */}
          <section id="responsabilite" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Limitation de responsabilité
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-medium text-yellow-900 mb-3">⚠️ Disponibilité du service</h3>
                <p className="text-yellow-800 mb-3">
                  Sanka Dev s'efforce d'assurer la disponibilité de l'application 24h/24 et 7j/7, 
                  mais ne peut garantir une disponibilité absolue.
                </p>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Interruptions possibles :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Maintenance programmée (avec préavis)</li>
                    <li>Incidents techniques imprévisibles</li>
                    <li>Cas de force majeure</li>
                    <li>Défaillance des réseaux de télécommunications</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">📋 Limitation de responsabilité</h3>
                <p className="text-gray-800 mb-3">
                  La responsabilité de Sanka Dev ne peut être engagée qu'en cas de manquement 
                  prouvé à ses obligations contractuelles ayant causé un dommage direct.
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Exclusions de responsabilité :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Dommages indirects ou immatériels</li>
                    <li>Perte de données due à une utilisation non conforme</li>
                    <li>Dommages résultant d'un cas de force majeure</li>
                    <li>Utilisation malveillante par des tiers</li>
                    <li>Non-respect des prérequis techniques</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h3 className="font-medium text-red-900 mb-3">🚨 Responsabilité de l'utilisateur</h3>
                <p className="text-red-800 mb-3">
                  L'utilisateur est seul responsable de :
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside ml-4 space-y-1">
                  <li>L'exactitude des données qu'il saisit</li>
                  <li>La confidentialité de ses identifiants de connexion</li>
                  <li>L'utilisation conforme de l'application</li>
                  <li>Le respect de la législation applicable</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Droit applicable */}
          <section id="droit-applicable" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Droit applicable et juridiction compétente
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Droit applicable</h3>
                    <p className="text-gray-700">
                      Les présentes mentions légales et l'utilisation de l'application sont régies 
                      par le droit français.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Règlement des litiges</h3>
                    <p className="text-gray-700 mb-2">
                      En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
                    </p>
                    <p className="text-gray-700">
                      À défaut d'accord amiable, les tribunaux français seront seuls compétents, 
                      nonobstant pluralité de défendeurs ou appel en garantie.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Juridiction compétente</h3>
                    <p className="text-gray-700">
                      Tribunal de commerce de Lille pour les litiges commerciaux, 
                      Tribunal judiciaire de Lille pour les autres litiges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact et informations légales
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Questions légales
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email :</strong> 
                    <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:underline ml-1">
                      admin@gardien-temps.com
                    </a>
                  </p>
                  <p><strong>Objet :</strong> "Question légale - Mentions légales"</p>
                  <p><strong>Réponse :</strong> Sous 5 jours ouvrés</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Support technique
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Pour les questions techniques :</strong></p>
                  <p><strong>Email :</strong> 
                    <a href="mailto:support@gardien-temps.com" className="text-blue-600 hover:underline ml-1">
                      support@gardien-temps.com
                    </a>
                  </p>
                  <p><strong>Horaires :</strong> Lundi-Vendredi 9h-18h</p>
                  <p><strong>Réponse :</strong> Sous 48h maximum</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-900 mb-2">📋 Informations importantes</h3>
              <div className="text-sm text-amber-800 space-y-1">
                <p>• Les mentions légales sont mises à jour régulièrement</p>
                <p>• Toute modification sera notifiée aux utilisateurs</p>
                <p>• Ces informations sont conformes à la réglementation française en vigueur</p>
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
            <Link to="/legal/cookie-policy" className="hover:text-blue-600 transition-colors">
              Politique des Cookies
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

export default LegalNotices;