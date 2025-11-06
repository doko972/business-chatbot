; Script NSIS personnalisé pour Chatbot wIDGET
; Ajoutez des personnalisations supplémentaires ici si nécessaire

!macro customHeader
  !system "echo 'Configuration installateur du Widget Kiki compagnon'"
!macroend

!macro customInstall
  ; Créer un raccourci sur le bureau
  CreateShortCut "$DESKTOP\Chatbot-widget-kiki.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  
  ; Message de bienvenue après installation
  MessageBox MB_OK "Le widget du chatbot Kiki compagnon a été installé avec succès !$\n$\nVous pouvez maintenant lancer l'application depuis le menu Démarrer ou le bureau.$\n$\nPour toute assistance : doko972@gmail.com"
!macroend

!macro customUnInstall
  ; Supprimer le raccourci du bureau
  Delete "$DESKTOP\Chatbot-widget-kiki.lnk"
  
  ; Message de désinstallation
  MessageBox MB_YESNO "Souhaitez-vous conserver vos paramètres de configuration ?" IDYES keepSettings
    RMDir /r "$APPDATA\chatbot-widget-windows"
  keepSettings:
!macroend
