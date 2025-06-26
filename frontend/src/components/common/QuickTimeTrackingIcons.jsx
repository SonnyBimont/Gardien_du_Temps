import React, { useState } from 'react';
import { Clock, Coffee, LogOut } from 'lucide-react';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { useAuthStore } from '../../stores/authStore';

/**
 * Composant d'icônes de pointage rapide pour les directeurs
 * 
 * Fonctionnalités :
 * - Pointage intelligent arrivée/départ (icône horloge)
 * - Gestion des pauses avec détection automatique (icône café)
 * - Départ direct sans logique complexe (icône sortie)
 * - Feedback visuel temporaire (toasts de confirmation)
 * - Adaptation de l'interface selon l'état du jour
 * - Restriction d'accès par rôle (directeur uniquement)
 * 
 * États gérés :
 * - Activation/désactivation des boutons selon le contexte
 * - Couleurs adaptatives (vert=disponible, rouge=départ, orange=pause, gris=indisponible)
 * - Messages d'aide contextuels (tooltips)
 */
const QuickTimeTrackingIcons = () => {
  // ===== ÉTAT LOCAL =====
  
  // Gestion des messages de feedback temporaires (succès/erreur)
  const [feedback, setFeedback] = useState(null);
  
  // ===== HOOKS EXTERNES =====
  
  // Récupération des données utilisateur depuis le store d'authentification
  const { user } = useAuthStore();
  
  // Hook personnalisé de gestion du pointage avec toute la logique métier
  const {
    actionLoading,              // Indique si une action est en cours
    canClockIn,                // Peut pointer l'arrivée
    canPauseOrResume,          // Peut gérer les pauses
    canClockOut,               // Peut pointer le départ
    handleIntelligentClockAction,  // Gestion intelligente arrivée/départ
    handleIntelligentBreakAction,  // Gestion intelligente pause/reprise
    clockOut,                  // Départ direct sans logique
    getTodayStatus,            // État actuel de la journée
    isOnBreak                  // Indique si actuellement en pause
  } = useTimeTracking(user?.id);

  // ===== CONTRÔLES D'ACCÈS =====
  
  // Restriction d'affichage : seuls les directeurs voient ces icônes
  if (user?.role !== 'director') {
    return null;
  }

  // ===== UTILITAIRES =====
  
  /**
   * Affiche un message de feedback temporaire
   * @param {string} message - Texte à afficher
   * @param {string} type - Type de message ('success' ou 'error')
   */
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    // Auto-suppression après 2 secondes
    setTimeout(() => setFeedback(null), 2000);
  };

  // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
  
  /**
   * Gestion du clic sur l'icône horloge (Clock)
   * Logique intelligente : arrivée si pas encore pointée, départ sinon
   */
  const handleClockClick = async () => {
    try {
      const result = await handleIntelligentClockAction();
      if (result.success) {
        // Détermination du message selon l'action effectuée
        const status = getTodayStatus();
        const message = !status.arrival ? '✅ Arrivée enregistrée' : '✅ Départ enregistré';
        showFeedback(message, 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur lors du pointage', 'error');
    }
  };

  /**
   * Gestion du clic sur l'icône café (Coffee)
   * Logique intelligente : début de pause si pas en pause, fin de pause sinon
   */
  const handleBreakClick = async () => {
    try {
      const result = await handleIntelligentBreakAction();
      if (result.success) {
        // Message adapté selon l'action (début ou fin de pause)
        const message = isOnBreak() ? '🔄 Pause terminée' : '☕ Pause commencée';
        showFeedback(message, 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur gestion pause', 'error');
    }
  };

  /**
   * Gestion du clic sur l'icône sortie (LogOut)
   * Départ direct sans logique complexe - toujours un départ
   */
  const handleDirectClockOut = async () => {
    try {
      const result = await clockOut();
      if (result.success) {
        showFeedback('✅ Départ enregistré', 'success');
      } else {
        showFeedback(`❌ ${result.error}`, 'error');
      }
    } catch (error) {
      showFeedback('❌ Erreur pointage sortie', 'error');
    }
  };

  // ===== STYLES =====
  
  // Classes CSS communes pour toutes les icônes (hover, transitions, taille)
  const iconClass = `
    w-8 h-8 p-1.5 rounded-lg cursor-pointer transition-all duration-200 
    hover:scale-110 hover:shadow-lg active:scale-95
  `;

  // ===== RENDU DU COMPOSANT =====
  
  return (
    <div className="flex items-center space-x-2 relative">
      
      {/* Indicateurs de debug en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mr-2">
          {/* Indicateurs visuels de l'état actuel */}
          {canClockIn ? '🟢' : canClockOut ? '🔴' : '⚪'} 
          {isOnBreak() ? '☕' : ''} 
        </div>
      )}
      
      {/* 
        ICÔNE 1 : HORLOGE (Clock) - Pointage intelligent arrivée/départ
        Couleur : Vert si peut arriver, Rouge si peut partir, Gris si indisponible
      */}
      <div
        onClick={!actionLoading && (canClockIn || canClockOut) ? handleClockClick : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canClockIn 
            ? 'bg-green-100 hover:bg-green-200 text-green-600 cursor-pointer'
            : canClockOut
            ? 'bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          canClockIn ? 'Pointage Arrivée' : 
          canClockOut ? 'Pointage Départ' : 
          'Non disponible'
        }
      >
        <Clock className="w-full h-full" />
      </div>

      {/* 
        ICÔNE 2 : CAFÉ (Coffee) - Gestion intelligente des pauses
        Couleur : Orange si disponible, Gris si indisponible
        Logique : Démarre une pause si pas en pause, termine la pause si en pause
      */}
      <div
        onClick={!actionLoading && canPauseOrResume ? handleBreakClick : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canPauseOrResume
            ? 'bg-orange-100 hover:bg-orange-200 text-orange-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          !getTodayStatus().arrival ? 'Pointez d\'abord votre arrivée'
          : getTodayStatus().departure ? 'Journée terminée'
          : isOnBreak() ? 'Terminer la pause'
          : 'Commencer une pause'
        }
      >
        <Coffee className="w-full h-full" />
      </div>

      {/* 
        ICÔNE 3 : SORTIE (LogOut) - Départ direct
        Couleur : Rouge si disponible, Gris si indisponible
        Différence avec Clock : Toujours un départ, pas d'intelligence
        
        ⚠️  POSSIBLE REDONDANCE : Cette icône fait la même chose que Clock 
        quand canClockOut est true. Pourrait être simplifié.
      */}
      <div
        onClick={!actionLoading && canClockOut ? handleDirectClockOut : undefined}
        className={`${iconClass} ${
          actionLoading ? 'opacity-50 cursor-not-allowed' :
          canClockOut
            ? 'bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={
          actionLoading ? 'En cours...' :
          !getTodayStatus().arrival ? 'Pointez d\'abord votre arrivée'
          : getTodayStatus().departure ? 'Départ déjà enregistré'
          : 'Pointage Départ'
        }
      >
        <LogOut className="w-full h-full" />
      </div>

      {/* 
        FEEDBACK TOAST - Messages temporaires de confirmation/erreur
        Positionné en absolu au-dessus des icônes
      */}
      {feedback && (
        <div className={`
          absolute top-12 right-0 z-50 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
          ${feedback.type === 'success' ? 'bg-green-600 text-white border border-green-700' : ''}
          ${feedback.type === 'error' ? 'bg-red-600 text-white border border-red-700' : ''}
          animate-in slide-in-from-top-2 duration-300
        `}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default QuickTimeTrackingIcons;


// 🔍 ANALYSE DES POSSIBLES REDONDANCES :

// ❓ REDONDANCE POTENTIELLE :
// - handleClockClick() et handleDirectClockOut() font la même chose quand canClockOut est true
// - Les deux appellent des fonctions différentes mais avec le même résultat
// - handleClockClick utilise handleIntelligentClockAction()
// - handleDirectClockOut utilise clockOut()
// - Cela pourrait être simplifié en une seule icône

// 💡 SUGGESTIONS D'AMÉLIORATION :
// 1. Fusionner les icônes Clock et LogOut en une seule icône intelligente
// 2. Ou garder LogOut comme "départ d'urgence" sans vérifications
// 3. Ajouter des tests unitaires pour ces interactions complexes
