import { TestBed } from '@angular/core/testing';
import { FirestoreService } from './firestore.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { Injectable } from '@angular/core';

describe('FirestoreService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AngularFirestore, useValue: jest.fn() },
                { provide: Store, useValue: jest.fn() }
            ]
        });
    });

    it('cant be directly instantiated', () => {
        expect(() => {
            TestBed.get(FirestoreService);
        }).toThrowError('No provider for FirestoreService!');
    });

    it('can be implemented and instantiated', () => {
        @Injectable({ providedIn: 'root' })
        class TestFirestore extends FirestoreService<{}> {
            protected path = 'test';
        }

        expect(TestBed.get(TestFirestore)).toBeTruthy();
    });
});
