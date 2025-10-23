#!/bin/bash

# Script de commit rapide Git
# Usage: ./quick-commit.sh "message de commit"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si un message de commit est fourni
if [ -z "$1" ]; then
    echo -e "${RED}Erreur: Veuillez fournir un message de commit${NC}"
    echo "Usage: ./quick-commit.sh \"votre message de commit\""
    exit 1
fi

# Vérifier si nous sommes dans un dépôt Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Erreur: Ce n'est pas un dépôt Git${NC}"
    exit 1
fi

# Afficher le statut actuel
echo -e "${YELLOW}📊 Statut actuel:${NC}"
git status --short

# Ajouter tous les fichiers modifiés
echo -e "\n${YELLOW}➕ Ajout des fichiers...${NC}"
git add .

# Faire le commit
echo -e "\n${YELLOW}💾 Création du commit...${NC}"
git commit -m "$1"

# Vérifier si le commit a réussi
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Commit réussi!${NC}"
    
    # Demander si on veut push
    read -p "Voulez-vous push vers le dépôt distant? (o/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        echo -e "${YELLOW}🚀 Push en cours...${NC}"
        git push
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Push réussi!${NC}"
        else
            echo -e "${RED}❌ Erreur lors du push${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ Erreur lors du commit${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Terminé!${NC}"