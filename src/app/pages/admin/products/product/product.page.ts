import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {  ToastController, ActionSheetController, Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-products',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: false,
  
})
export class ProductPage implements OnInit {
  categories = [
  { name: 'Électronique', slug: 'electronique', image: 'assets/categories/electronics.jpg' },
  { name: 'Mode & Accessoires', slug: 'mode-accessoires', image: 'assets/categories/fashion.jpg' },
  { name: 'Maison & Cuisine', slug: 'maison-cuisine', image: 'assets/categories/home.jpg' },
  { name: 'Beauté & Santé', slug: 'beaute-sante', image: 'assets/categories/beauty.jpg' },
  { name: 'Sports & Loisirs', slug: 'sports-loisirs', image: 'assets/categories/sport.jpg' },
];

  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  pageTitle = 'Ajouter Produit';
  isMobile = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private platform: Platform
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]], 
      image: ['']
    });

    this.isMobile = this.platform.is('capacitor');
  }

  ngOnInit() {
    console.log('ProductsPage - ngOnInit');
    console.log('Plateforme mobile:', this.isMobile);
    
    this.route.paramMap.subscribe(params => {
      console.log('Params:', params);
      const id = params.get('id');
      console.log('Product ID:', id);
      
      if (id) {
        this.productId = id;
        this.isEditMode = true;
        this.pageTitle = 'Modifier Produit';
        console.log('Mode ÉDITION - ID:', id);
        this.loadProduct(id);
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Ajouter Produit';
        console.log('Mode CRÉATION');
        this.productForm.reset();
      }
    });
  }

loadProduct(id: string) {
  console.log('Chargement du produit:', id);
  this.loading = true;
  this.productService.getProductById(id).subscribe({
    next: (product) => {
      console.log('Produit chargé:', product);
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.imageUrl || ''
        });
      }
    },
    error: (err) => console.error('Erreur :', err),
    complete: () => (this.loading = false),
  });
}


  async onSubmit() {
    console.log('onSubmit - isEditMode:', this.isEditMode);
    
    if (this.productForm.valid) {
      this.loading = true;
      const productData = this.productForm.value;
      console.log('Données du produit:', productData);

      try {
        if (this.isEditMode && this.productId) {
          console.log('Mise à jour du produit:', this.productId);
          await this.productService.updateProduct(this.productId, productData);
          await this.showToast('Produit mis à jour avec succès ✓', 'success');
        } else {
          console.log('Création d\'un nouveau produit');
          await this.productService.addProduct(productData);
          await this.showToast('Produit créé avec succès ✓', 'success');
        }

        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1000);

      } catch (err: any) {
        console.error('Erreur:', err);
        await this.showToast('Erreur lors de l\'opération', 'danger');
        this.loading = false;
      }
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      await this.showToast('Veuillez remplir tous les champs requis', 'warning');
    }
  }

  cancel() {
    this.router.navigate(['/admin']);
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 3 caractères';
    }
    if (control?.hasError('min')) {
      return 'Valeur doit être positive';
    }
    return '';
  }

  async uploadImage() {
    if (this.isMobile) {
      await this.showMobileImageOptions();
    } else {
      await this.showWebImageOptions();
    }
  }

  async showWebImageOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choisir une image',
      buttons: [
        {
          text: 'Prendre une photo (Webcam)',
          icon: 'camera',
          handler: () => {
            this.openWebcam();
          }
        },
        {
          text: 'Importer depuis PC',
          icon: 'cloud-upload',
          handler: () => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            fileInput?.click();
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async showMobileImageOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choisir une image',
      buttons: [
        {
          text: 'Prendre une photo',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Galerie',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Annuler',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      const imageDataUrl = image.dataUrl;
      
      if (imageDataUrl) {
        this.productForm.patchValue({
          image: imageDataUrl
        });
        console.log('Image capturée avec succès');
        await this.showToast('Image ajoutée ✓', 'success');
      }
    } catch (error: any) {
      console.error('Erreur lors de la capture:', error);
      if (error.message !== 'User cancelled photos app') {
        await this.showToast('Erreur lors de la capture de l\'image', 'danger');
      }
    }
  }

  async openWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });

      this.showWebcamModal(stream);
    } catch (error) {
      console.error('Erreur accès webcam:', error);
      await this.showToast('Impossible d\'accéder à la webcam', 'danger');
    }
  }

  showWebcamModal(stream: MediaStream) {
    const overlay = document.createElement('div');
    overlay.className = 'webcam-overlay';

    const title = document.createElement('h2');
    title.className = 'webcam-title';
    title.innerHTML = '📸 Prendre une photo';

    const video = document.createElement('video');
    video.className = 'webcam-video';
    video.autoplay = true;
    video.srcObject = stream;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'webcam-buttons';

    const captureBtn = document.createElement('button');
    captureBtn.className = 'webcam-btn capture-btn';
    captureBtn.innerHTML = '📸 Capturer';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'webcam-btn cancel-btn';
    cancelBtn.innerHTML = '❌ Annuler';

    captureBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      this.productForm.patchValue({ image: imageDataUrl });
      
      stream.getTracks().forEach(track => track.stop());
      overlay.remove();
      this.showToast('Photo capturée avec succès ✓', 'success');
    };

    cancelBtn.onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      overlay.remove();
    };

    btnContainer.appendChild(captureBtn);
    btnContainer.appendChild(cancelBtn);
    overlay.appendChild(title);
    overlay.appendChild(video);
    overlay.appendChild(btnContainer);
    document.body.appendChild(overlay);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      console.log('Fichier sélectionné:', file.name);

      if (!file.type.startsWith('image/')) {
        this.showToast('Veuillez sélectionner une image valide', 'warning');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showToast('L\'image ne doit pas dépasser 5MB', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        this.productForm.patchValue({
          image: imageDataUrl
        });
        console.log('Image convertie en Data URL');
        this.showToast('Image ajoutée ✓', 'success');
      };
      reader.readAsDataURL(file);

      input.value = '';
    }
  }
}