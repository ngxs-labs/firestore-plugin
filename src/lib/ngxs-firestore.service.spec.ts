import { TestBed } from '@angular/core/testing';
import { NgxsFirestore } from './ngxs-firestore.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

describe('NgxsFirestore', () => {
  const createIdMock = jest.fn();
  const angularFirestoreMock = jest.fn().mockImplementation(() => ({
    createId: createIdMock,
    doc: jest.fn(() => ({
      set: jest.fn(() => of({})),
      ref: {
        withConverter: jest.fn()
      }
    }))
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: angularFirestoreMock() },
        {
          provide: AngularFirestore,
          useValue: angularFirestoreMock()
        },
        { provide: Store, useValue: jest.fn() }
      ]
    });
  });

  it('cant be directly instantiated', () => {
    expect(() => {
      TestBed.get(NgxsFirestore);
    }).toThrowError('No provider for NgxsFirestore!');
  });

  it('can be implemented and instantiated', () => {
    @Injectable({ providedIn: 'root' })
    class TestFirestore extends NgxsFirestore<{}> {
      protected path = 'test';
    }

    expect(TestBed.get(TestFirestore)).toBeTruthy();
  });

  describe('', () => {
    @Injectable({ providedIn: 'root' })
    class ImplFirestore extends NgxsFirestore<{}> {
      protected path = 'impl';
    }

    describe('create$', () => {
      it('should create id if not provided', () => {
        createIdMock.mockReturnValue('newId');
        const service: ImplFirestore = TestBed.get(ImplFirestore);
        service.create$({}).subscribe((id) => {
          expect(id).toEqual('newId');
        });
      });

      it('should return id when provided', () => {
        const service: ImplFirestore = TestBed.get(ImplFirestore);
        service.create$({ id: 'someid' }).subscribe((id) => {
          expect(id).toEqual('someid');
        });
      });
    });

    describe('upsert$', () => {
      it('should create id if not provided', () => {
        createIdMock.mockReturnValue('newId');
        const service: ImplFirestore = TestBed.get(ImplFirestore);
        service.upsert$({}).subscribe((id) => {
          expect(id).toEqual('newId');
        });
      });

      it('should return id when provided', () => {
        const service: ImplFirestore = TestBed.get(ImplFirestore);
        service.upsert$({ id: 'someid' }).subscribe((id) => {
          expect(id).toEqual('someid');
        });
      });
    });
  });
});
