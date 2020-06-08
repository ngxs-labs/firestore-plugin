import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFirestore, Query } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { NgxsFirestorePagination } from './ngxs-firestore-pagination.service';

interface DocumentData {
    name: string;
}

@Injectable({ providedIn: 'root' })
class ClientMock extends NgxsFirestorePagination<DocumentData> {
    protected path = 'test';
    protected format = (data: DocumentData) => data;
    protected limit: number = 5;
    protected orderBy: 'name' = 'name';
    protected orderByDirection: any;
}

function factoryDocuments(amount: number) {
    const items = [];
    const documentMock = {
        payload: {
            doc: {
                data: () => {}
            }
        }
    };
    for (let i = 0; i < amount; i++) {
        items.push(documentMock);
    }
    return items;
}

class Firestore {
    amount = 0;
    collection(path: string, query: Query) {
        if (query) {
            return {
                snapshotChanges: () => of(factoryDocuments(5))
            };
        }
        return {
            snapshotChanges: () => of(factoryDocuments(this.amount))
        };
    }
}

describe('NgxsFirestorePagination', () => {
    let service;
    let firestore;
    beforeEach(() => {
        firestore = new Firestore();
        TestBed.configureTestingModule({
            providers: [
                { provide: AngularFirestore, useValue: firestore },
                { provide: Store, useValue: jest.fn() }
            ]
        });
        service = TestBed.get(ClientMock);
    });

    it('cant be directly instantiated', () => {
        expect(() => {
            TestBed.get(NgxsFirestorePagination);
        }).toThrowError('No provider for NgxsFirestorePagination!');
    });
    it('should call to firestore', (done) => {
        service.collection$().subscribe((data) => {
            expect(data.length).toBe(0);
            done();
        });
    });
    it('should get the top 5 items', (done) => {
        firestore.amount = 10;
        service.collection$().subscribe((data) => {
            expect(data.length).toBe(5);
            done();
        });
    });
});
