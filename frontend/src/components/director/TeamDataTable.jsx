import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import Card from '../common/Card';
import Button from '../common/Button';
                
// Données d'équipe
export const renderTeamData = (teamData,handleAnimatorSelection, handleEditUser, handleTeamDataLoad, toggleUserStatus ) => (
  <Card title="Données d'équipe">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heures travaillées</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objectif</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Différence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teamData.length > 0 ? (
            teamData.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${member.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.totalHours || '0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {/*  Afficher l'objectif cohérent avec la période */}
                  {member.periodObjective || '0'}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Afficher la différence en heures au lieu du pourcentage */}
                  <span className={`${
                    (member.hoursDifference || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {(member.hoursDifference || 0) >= 0 ? '+' : ''}{member.hoursDifference || '0'}h
                  </span>
                </td>
                {/* Colonne Statut */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnimatorSelection(member.id)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(member)}
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await toggleUserStatus(member.id, !member.active);
                          logger.log(`✅ Statut animateur ${member.id} modifié`);
                          await handleTeamDataLoad();
                        } catch (error) {
                          logger.error('❌ Erreur toggle status:', error);
                        }
                      }}
                      variant={member.active ? "success" : "danger"}
                      size="sm"
                      className="min-w-[80px]"
                    >
                      {member.active ? 'Actif' : 'Inactif'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                Aucune donnée d'équipe disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Card>
);