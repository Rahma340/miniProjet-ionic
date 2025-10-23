import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ActionSheetController, Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { Photos } from '../../../../services/photo.service';

@Component({
  selector: 'app-products',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: false,
})
export class ProductPage implements OnInit, OnDestroy {
  categories = [
    { name: 'Électronique', slug: 'electronique', image: 'assets/categories/electronics.jpg' },
    { name: 'Mode & Accessoires', slug: 'mode-accessoires', image: 'assets/categories/fashion.jpg' },
    { name: 'Maison & Cuisine', slug: 'maison-cuisine', image: 'assets/categories/home.jpg' },
    { name: 'Beauté & Santé', slug: 'beaute-sante', image: 'assets/categories/beauty.jpg' },
    { name: 'Sports & Loisirs', slug: 'sports-loisirs', image: 'assets/categories/sport.jpg' },
  ];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  pageTitle = 'Ajouter Produit';
  isMobile = false;

  // Webcam
  showWebcam = false;
  videoElement: HTMLVideoElement | null = null;
  streamReference: MediaStream | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private photoSer: Photos,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      image: [''],
      category: ['', Validators.required]
    });

    this.isMobile = this.platform.is('capacitor');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = id;
        this.isEditMode = true;
        this.pageTitle = 'Modifier Produit';
        this.loadProduct(id);
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Ajouter Produit';
        this.productForm.reset();
      }
    });
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.imageUrl || '',
            category: product.category || ''
          });
        }
      },
      error: (err) => console.error('Erreur :', err),
      complete: () => (this.loading = false),
    });
  }

  async onSubmit() {
    if (!this.productForm.valid) {
      Object.keys(this.productForm.controls).forEach(key => this.productForm.get(key)?.markAsTouched());
      await this.showToast('Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    this.loading = true;
    const productData = this.productForm.value;
    try {
      if (this.isEditMode && this.productId) {
        await this.productService.updateProduct(this.productId, productData);
        await this.showToast('Produit mis à jour avec succès', 'success');
      } else {
        await this.productService.addProduct(productData);
        await this.showToast('Produit créé avec succès', 'success');
      }
      setTimeout(() => this.router.navigate(['/admin/list-product']), 1000);

    } catch (err: any) {
      console.error(err);
      await this.showToast('Erreur lors de l\'opération', 'danger');
      this.loading = false;
    }
  }

cancel() {
  this.router.navigate(['/admin/list-product']);
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
    if (control?.hasError('required')) return 'Ce champ est requis';
    if (control?.hasError('minlength')) return 'Minimum 3 caractères';
    if (control?.hasError('min')) return 'Valeur doit être positive';
    return '';
  }

  // --------------------------- GESTION DES IMAGES ---------------------------
  async uploadImage() {
    if (this.isMobile) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Ajouter une photo',
        buttons: [
          {
            text: 'Prendre une photo',
            icon: 'camera',
            handler: async () => {
              try {
                const img = await this.photoSer.takePicture();
                if (img) {
                  this.productForm.patchValue({ image: img });
                  this.cdr.detectChanges();
                  await this.showToast('Photo capturée avec succès', 'success');
                }
              } catch {
                await this.showToast("Vous n'avez pas pris de photo", 'danger');
              }
            }
          },
          {
            text: 'Choisir depuis la galerie',
            icon: 'image',
            handler: async () => {
              try {
                const tabImages = await this.photoSer.selectionnerPhotos();
                if (tabImages?.photos?.length) {
                  this.productForm.patchValue({ image: tabImages.photos[0].webPath });
                  this.cdr.detectChanges();
                  await this.showToast('Image sélectionnée avec succès', 'success');
                }
              } catch {
                await this.showToast("Erreur lors de la sélection", 'danger');
              }
            }
          },
          { text: 'Annuler', icon: 'close-outline', role: 'cancel' }
        ]
      });
      await actionSheet.present();
    } else {
      const actionSheet = await this.actionSheetController.create({
        header: 'Ajouter une photo',
        buttons: [
          {
            text: 'Prendre une photo avec la webcam',
            icon: 'camera-outline',
            handler: () => this.openWebcam()
          },
          {
            text: 'Importer depuis PC',
            icon: 'cloud-upload-outline',
            handler: () => this.fileInput.nativeElement.click()
          },
          { text: 'Annuler', icon: 'close-outline', role: 'cancel' }
        ]
      });
      await actionSheet.present();
    }
  }

  // --------------------------- WEBCAM ---------------------------
  async openWebcam() {
    this.showWebcam = true;
    this.cdr.detectChanges();

    setTimeout(async () => {
      this.videoElement = document.getElementById('webcamVideo') as HTMLVideoElement;
      if (!this.videoElement) {
        await this.showToast('Erreur: Élément vidéo non trouvé', 'danger');
        this.showWebcam = false;
        this.cdr.detectChanges();
        return;
      }

      this.videoElement.width = 640;
      this.videoElement.height = 480;

      await this.startWebcam();
    }, 50); // Petit délai pour que le DOM soit rendu
  }

  private async startWebcam() {
    if (!this.videoElement) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      this.streamReference = stream;
      this.videoElement.srcObject = stream;
      await this.videoElement.play();
    } catch (err: any) {
      console.error('Erreur caméra:', err);
      this.showWebcam = false;
      let msg = 'Impossible d\'accéder à la caméra';
      if (err.name === 'NotAllowedError') msg = 'Permission refusée pour la caméra';
      if (err.name === 'NotFoundError') msg = 'Aucune caméra détectée';
      if (err.name === 'NotReadableError') msg = 'La caméra est déjà utilisée';
      await this.showToast(msg, 'danger');
      this.cdr.detectChanges();
    }
  }

  async capturePhoto() {
    if (!this.videoElement) {
      await this.showToast('Erreur: Vidéo non disponible', 'danger');
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Impossible de créer le contexte canvas');
      ctx.drawImage(this.videoElement, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      this.closeWebcam();
      this.productForm.patchValue({ image: dataUrl });
      this.cdr.detectChanges();
      await this.showToast('Photo capturée avec succès', 'success');
    } catch {
      this.closeWebcam();
      await this.showToast('Erreur lors de la capture', 'danger');
    }
  }

  closeWebcam() {
    if (this.streamReference) this.streamReference.getTracks().forEach(track => track.stop());
    this.streamReference = null;
    if (this.videoElement) this.videoElement.srcObject = null;
    this.videoElement = null;
    this.showWebcam = false;
    this.cdr.detectChanges();
  }

  // --------------------------- GESTION FICHIERS ---------------------------
  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await this.showToast('Veuillez sélectionner une image valide', 'warning');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      await this.showToast('L\'image ne doit pas dépasser 5MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.productForm.patchValue({ image: e.target?.result as string });
      this.cdr.detectChanges();
      this.showToast('Image ajoutée', 'success');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeImage() {
    this.productForm.patchValue({ image: '' });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.closeWebcam();
  }
}
