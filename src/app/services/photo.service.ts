import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class Photos {
  constructor(private platform: Platform) {}

  /**
   * Prendre une photo avec la caméra
   * - Sur mobile : utilise Capacitor Camera
   * - Sur Web/PC : retourne une erreur pour forcer l'utilisation de la webcam HTML
   */
  async takePicture(): Promise<string | undefined> {
    // Si on est sur une application mobile native
    if (this.platform.is('capacitor')) {
      let capturedPhoto = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.DataUrl,
      });
      console.log('Photo prise (mobile):', capturedPhoto.dataUrl);
      return capturedPhoto.dataUrl;
    } 
    // Si on est sur le Web/PC, ne rien faire
    // La capture se fera directement dans le composant avec la webcam HTML
    else {
      throw new Error('Utilisez la webcam HTML pour la capture sur Web');
    }
  }

  /**
   * Sélectionner des photos depuis la galerie
   */
  async selectionnerPhotos() {
    // Sur mobile native
    if (this.platform.is('capacitor')) {
      let selectedPhotos = await Camera.pickImages({
        quality: 90,
        limit: 5,
      });
      console.log('Photos sélectionnées (mobile):', selectedPhotos);
      return selectedPhotos;
    } 
    // Sur Web, on laisse le input file gérer ça
    else {
      throw new Error('Utilisez le input file pour la galerie sur Web');
    }
  }
}