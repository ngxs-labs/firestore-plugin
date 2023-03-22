import { TestBed } from '@angular/core/testing';
import { NgxsFirestore } from './ngxs-firestore.service';
import { Firestore, doc, DocumentReference, setDoc } from '@angular/fire/firestore';
import { Store } from '@ngxs/store';
import { Injectable } from '@angular/core';

jest.mock('@angular/fire/firestore');

describe('NgxsFirestore', () => {
  const createIdMock = jest.fn();
  const mockDoc = jest.mocked(doc);
  mockDoc.mockImplementation(
    () => (({ id: createIdMock(), withConverter: jest.fn() } as unknown) as DocumentReference)
  );
  jest.mocked(setDoc).mockResolvedValue();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: jest.fn() },
        { provide: Store, useValue: jest.fn() }
      ]
    });
  });

  it('cant be directly instantiated', () => {
    expect(() => {
      TestBed.inject(NgxsFirestore);
    }).toThrowError('No provider for NgxsFirestore!');
  });

  it('can be implemented and instantiated', () => {
    @Injectable({ providedIn: 'root' })
    class TestFirestore extends NgxsFirestore<{}> {
      protected path = 'test';
    }

    expect(TestBed.inject(TestFirestore)).toBeTruthy();
  });

  describe('', () => {
    @Injectable({ providedIn: 'root' })
    class ImplFirestore extends NgxsFirestore<{}> {
      protected path = 'impl';
    }

    describe('create$', () => {
      it('should create id if not provided', async () => {
        createIdMock.mockReturnValue('newId');
        const service: ImplFirestore = TestBed.inject(ImplFirestore);
        const id = await service.create$({}).toPromise();
        expect(id).toEqual('newId');
      });

      it('should return id when provided', async () => {
        const service: ImplFirestore = TestBed.inject(ImplFirestore);
        const id = await service.create$({ id: 'someid' }).toPromise();
        expect(id).toEqual('someid');
      });
    });

    describe('upsert$', () => {
      it('should create id if not provided', async () => {
        createIdMock.mockReturnValue('newId');
        const service: ImplFirestore = TestBed.inject(ImplFirestore);
        const id = await service.upsert$({}).toPromise();
        expect(id).toEqual('newId');
      });

      it('should return id when provided', async () => {
        const service: ImplFirestore = TestBed.inject(ImplFirestore);
        const id = await service.upsert$({ id: 'someid' }).toPromise();
        expect(id).toEqual('someid');
      });
    });
  });
});
