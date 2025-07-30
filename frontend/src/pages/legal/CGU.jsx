/**
 * CONDITIONS GÉNÉRALES D'UTILISATION - GARDIEN DU TEMPS
 * 
 * Page légale complète respectant :
 * - Code de la consommation français
 * - RGPD (Règlement Général sur la Protection des Données)
 * - RGAA (Référentiel Général d'Amélioration de l'Accessibilité)
 * - Loi pour une République numérique
 * 
 * Conformité RGAA :
 * - Structure sémantique (h1, h2, nav)
 * - Navigation par liens d'ancrage
 * - Contraste respecté
 * - Lisibilité optimisée
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Shield } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Retour à la page de connexion"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Conditions d'Utilisation
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation interne (RGAA) */}
        <nav aria-label="Sommaire des conditions d'utilisation" className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Sommaire
            </h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#article-1" className="text-blue-700 hover:text-blue-800 hover:underline">1. Objet et champ d'application</a></li>
              <li><a href="#article-2" className="text-blue-700 hover:text-blue-800 hover:underline">2. Accès au service et inscription</a></li>
              <li><a href="#article-3" className="text-blue-700 hover:text-blue-800 hover:underline">3. Description du service</a></li>
              <li><a href="#article-4" className="text-blue-700 hover:text-blue-800 hover:underline">4. Obligations de l'utilisateur</a></li>
              <li><a href="#article-5" className="text-blue-700 hover:text-blue-800 hover:underline">5. Protection des données personnelles</a></li>
              <li><a href="#article-6" className="text-blue-700 hover:text-blue-800 hover:underline">6. Propriété intellectuelle</a></li>
              <li><a href="#article-7" className="text-blue-700 hover:text-blue-800 hover:underline">7. Responsabilité</a></li>
              <li><a href="#article-8" className="text-blue-700 hover:text-blue-800 hover:underline">8. Durée et résiliation</a></li>
              <li><a href="#article-9" className="text-blue-700 hover:text-blue-800 hover:underline">9. Droit applicable et juridiction</a></li>
            </ul>
          </div>
        </nav>

        {/* Articles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Préambule */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation 
              de l'application "Gardien du Temps", solution de gestion du temps de travail 
              destinée aux centres de loisirs et structures d'accueil extrascolaire.
            </p>
          </div>

          {/* Article 1 */}
          <section id="article-1" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Objet et champ d'application
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                Les présentes CGU ont pour objet de définir les modalités et conditions 
                d'utilisation de l'application "Gardien du Temps" (ci-après "le Service") 
                mise à disposition par [Nom de votre société] (ci-après "l'Éditeur").
              </p>
              <p className="mb-4">
                Le Service permet aux utilisateurs de :
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Enregistrer leurs heures de travail (pointage)</li>
                <li>Consulter leurs plannings et statistiques</li>
                <li>Gérer les équipes et structures (selon les droits d'accès)</li>
                <li>Exporter des rapports de temps de travail</li>
              </ul>
              <p>
                L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section id="article-2" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Accès au service et inscription
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium mb-3">2.1 Conditions d'accès</h3>
              <p className="mb-4">
                L'accès au Service est réservé aux employés des centres de loisirs et 
                structures partenaires. L'inscription se fait uniquement sur invitation 
                de l'administrateur de votre structure.
              </p>
              
              <h3 className="text-lg font-medium mb-3">2.2 Création de compte</h3>
              <p className="mb-4">
                Pour accéder au Service, l'utilisateur doit :
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Fournir des informations exactes et à jour</li>
                <li>Conserver la confidentialité de ses identifiants</li>
                <li>Informer immédiatement l'Éditeur de toute utilisation non autorisée</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">2.3 Profils utilisateurs</h3>
              <p className="mb-4">Trois types de profils sont disponibles :</p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li><strong>Animateur :</strong> Gestion du pointage personnel</li>
                <li><strong>Directeur :</strong> Gestion d'équipe et rapports</li>
                <li><strong>Administrateur :</strong> Gestion globale du système</li>
              </ul>
            </div>
          </section>

          {/* Article 3 */}
          <section id="article-3" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Description du service
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium mb-3">3.1 Fonctionnalités</h3>
              <p className="mb-4">Le Service propose les fonctionnalités suivantes :</p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Pointage en temps réel (arrivée, départ, pauses)</li>
                <li>Tableau de bord personnalisé avec statistiques</li>
                <li>Gestion des plannings prévisionnels</li>
                <li>Suivi des heures réalisées vs planifiées</li>
                <li>Export de rapports (PDF, Excel)</li>
                <li>Notifications et alertes</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">3.2 Disponibilité</h3>
              <p className="mb-4">
                L'Éditeur s'engage à fournir un service disponible 24h/24 et 7j/7. 
                Cependant, des interruptions peuvent survenir pour maintenance ou cas de force majeure.
              </p>
              
              <h3 className="text-lg font-medium mb-3">3.3 Évolutions</h3>
              <p>
                L'Éditeur se réserve le droit de faire évoluer le Service, d'ajouter ou 
                supprimer des fonctionnalités, sous réserve d'en informer les utilisateurs.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section id="article-4" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. Obligations de l'utilisateur
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">L'utilisateur s'engage à :</p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Utiliser le Service conformément à sa destination</li>
                <li>Respecter la législation en vigueur</li>
                <li>Ne pas porter atteinte à l'ordre public ou aux bonnes mœurs</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                <li>Signaler tout dysfonctionnement ou utilisation frauduleuse</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">4.1 Usage professionnel</h3>
              <p className="mb-4">
                Le Service est exclusivement destiné à un usage professionnel dans le cadre 
                de l'activité de l'utilisateur au sein de sa structure d'emploi.
              </p>
              
              <h3 className="text-lg font-medium mb-3">4.2 Exactitude des données</h3>
              <p>
                L'utilisateur garantit l'exactitude des informations de pointage saisies. 
                Toute fraude ou fausse déclaration engage sa responsabilité.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section id="article-5" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. Protection des données personnelles
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                Le traitement des données personnelles est régi par notre 
                <Link to="/legal/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">
                  Politique de Confidentialité
                </Link>, 
                conforme au Règlement Général sur la Protection des Données (RGPD).
              </p>
              
              <h3 className="text-lg font-medium mb-3">5.1 Données collectées</h3>
              <p className="mb-4">Les données suivantes sont collectées :</p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Données d'identification (nom, prénom, email)</li>
                <li>Données de pointage (heures d'arrivée, départ, pauses)</li>
                <li>Données de navigation (logs de connexion)</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">5.2 Vos droits</h3>
              <p>
                Conformément au RGPD, vous disposez des droits d'accès, rectification, 
                effacement, portabilité et opposition. Pour exercer ces droits, 
                contactez : <a href="mailto:admin@gardien-temps.com" className="text-blue-600 hover:text-blue-700 underline">admin@gardien-temps.com</a>
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section id="article-6" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. Propriété intellectuelle
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                L'ensemble du Service (logiciel, interface, contenus, marques) est protégé 
                par les droits de propriété intellectuelle et appartient à l'Éditeur ou à ses partenaires.
              </p>
              <p className="mb-4">
                L'utilisateur obtient un droit d'usage personnel, non exclusif et non cessible 
                du Service, uniquement dans le cadre des présentes CGU.
              </p>
              <p>
                Toute reproduction, représentation, modification ou exploitation non autorisée 
                est strictement interdite et constitue une contrefaçon.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section id="article-7" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. Responsabilité
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium mb-3">7.1 Responsabilité de l'Éditeur</h3>
              <p className="mb-4">
                L'Éditeur met en œuvre tous les moyens raisonnables pour assurer un accès 
                continu et sécurisé au Service. Sa responsabilité ne peut être engagée qu'en 
                cas de manquement prouvé à ses obligations.
              </p>
              
              <h3 className="text-lg font-medium mb-3">7.2 Limitation de responsabilité</h3>
              <p className="mb-4">
                L'Éditeur ne peut être tenu responsable :
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Des dommages indirects ou immatériels</li>
                <li>De la perte de données due à une utilisation non conforme</li>
                <li>Des interruptions dues à la maintenance ou cas de force majeure</li>
                <li>De l'utilisation malveillante du Service par des tiers</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">7.3 Responsabilité de l'utilisateur</h3>
              <p>
                L'utilisateur est seul responsable de l'utilisation qu'il fait du Service 
                et des données qu'il y saisit.
              </p>
            </div>
          </section>

          {/* Article 8 */}
          <section id="article-8" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              8. Durée et résiliation
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium mb-3">8.1 Durée</h3>
              <p className="mb-4">
                Les présentes CGU s'appliquent pendant toute la durée d'utilisation du Service 
                par l'utilisateur.
              </p>
              
              <h3 className="text-lg font-medium mb-3">8.2 Résiliation</h3>
              <p className="mb-4">
                L'accès au Service peut être suspendu ou résilié :
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>À la demande de l'utilisateur</li>
                <li>En cas de cessation d'activité de la structure employeuse</li>
                <li>En cas de manquement grave aux présentes CGU</li>
                <li>Pour des raisons techniques ou économiques (préavis de 30 jours)</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-3">8.3 Conséquences de la résiliation</h3>
              <p>
                En cas de résiliation, l'utilisateur perd l'accès au Service. 
                Les données peuvent être conservées selon les obligations légales.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section id="article-9" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              9. Droit applicable et juridiction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="mb-4">
                Les présentes CGU sont régies par le droit français.
              </p>
              <p className="mb-4">
                En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
              </p>
              <p>
                À défaut d'accord amiable, les tribunaux français seront seuls compétents, 
                nonobstant pluralité de défendeurs ou appel en garantie.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact et réclamations
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="mb-4">
                Pour toute question relative aux présentes CGU ou au Service :
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email :</strong> <a href="mailto:support@gardien-temps.com" className="text-blue-600 hover:text-blue-700 underline">support@gardien-temps.com</a></p>
                <p><strong>Adresse :</strong> [1 rue de Sanka Dev 59000 Lille]</p>
                <p><strong>Téléphone :</strong> [01.02.03.04.05]</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="/legal/privacy-policy" className="hover:text-blue-600 transition-colors">
              Politique de confidentialité
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
          <div className="mt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Gardien du Temps. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;