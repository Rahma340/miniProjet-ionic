import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
@Injectable ({ providedIn :'root'})
export class AuthService {
    constructor(private auth : Auth , private firestore :Firestore  ){}
    async register(email : string , password : string , role : 'client' | 'admin' , displayName? : string){
        const userCred = await createUserWithEmailAndPassword(this.auth , email , password);
        const userRef = doc(this.firestore , `users/${userCred.user.uid}`)
        await setDoc (userRef , {
            uid : userCred.user.uid ,
            email ,
            role ,
            displayName : displayName || null ,
            createdAt :  new Date().toDateString()
        });
        return userCred.user;
        }
        async login(email : string , password : string){
            const userCred = await signInWithEmailAndPassword(this.auth , email , password)
            const userDoc = await getDoc(doc(this.firestore , `users/${userCred.user.uid}`));
            return userDoc.exists() ? userDoc.data() : null ;
        }

        logout() {
            return signOut(this.auth)
        }
          getCurrentUid() {
    return this.auth.currentUser?.uid || null;
  }

    

    }
