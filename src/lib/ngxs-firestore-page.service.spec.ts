import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { Action, NgxsModule, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { BehaviorSubject } from 'rxjs';
import { StreamEmitted } from './action-decorator-helpers';
import { GetLastPage, GetNextPage } from './actions';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { NgxsFirestorePageService } from './ngxs-firestore-page.service';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { Emitted, Page } from './types';

describe('NgxsFirestorePage', () => {
  let store: Store;

  const mockFirestoreStream = jest.fn();
  const mockCreateId = jest.fn();
  const mockAngularFirestore = jest.fn(() => ({
    createId: mockCreateId
  }));

  class TestActionGetPages {
    static type = 'TEST ACTION GET PAGES';
  }

  @State({
    name: 'test'
  })
  @Injectable()
  class TestState implements NgxsOnInit {
    @Selector() static pageId(state) {
      return state.pageId;
    }

    @Selector() static pageSize(state) {
      return state.pageSize;
    }

    @Selector() static results(state) {
      return state.results;
    }

    constructor(
      private ngxsFirestoreConnect: NgxsFirestoreConnect,
      private ngxsFirestorePage: NgxsFirestorePageService
    ) {}

    ngxsOnInit() {
      this.ngxsFirestoreConnect.connect(TestActionGetPages, {
        to: () =>
          this.ngxsFirestorePage.create((pageFn) => mockFirestoreStream((ref) => pageFn(ref)), 5, [
            { fieldPath: 'title' }
          ])
      });
    }

    @Action(StreamEmitted(TestActionGetPages))
    getPageEmitted(ctx: StateContext<any>, { action, payload }: Emitted<TestActionGetPages, Page<any>>) {
      ctx.setState(patch({ results: payload.results || [], pageId: payload.pageId, pageSize: payload.pageSize }));
    }
  }

  const page1 = ['1', '2', '3'];
  // const page2 = ['1', '2', '3', '4', '5', '6'];
  // const page3 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TestState]), NgxsFirestoreModule.forRoot()],
      providers: [
        {
          provide: AngularFirestore,
          useValue: mockAngularFirestore()
        }
      ]
    });
    store = TestBed.inject(Store);
    // actions = TestBed.inject(Actions);

    mockFirestoreStream.mockClear();
  });

  test('should increase pageSize on each getnextpage', fakeAsync(() => {
    mockCreateId.mockReturnValue('pageId');

    const stream = new BehaviorSubject(page1);
    mockFirestoreStream.mockReturnValue(stream.asObservable());

    store.dispatch(new TestActionGetPages()).subscribe((_) => {});
    tick(1);

    expect(store.selectSnapshot(TestState.results)).toEqual(page1);
    expect(mockFirestoreStream).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);

    store.dispatch(new GetNextPage('pageId')).subscribe((_) => {});
    tick(1);
    expect(mockFirestoreStream).toHaveBeenCalledTimes(2);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(10);

    store.dispatch(new GetNextPage('pageId')).subscribe((_) => {});
    tick(1);
    expect(mockFirestoreStream).toHaveBeenCalledTimes(3);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(15);
  }));

  test('should not allow lastpage until at least two pages have been fetched', fakeAsync(() => {
    mockCreateId.mockReturnValue('pageId');

    const stream = new BehaviorSubject(page1);
    mockFirestoreStream.mockReturnValue(stream.asObservable());

    store.dispatch(new TestActionGetPages()).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);

    store.dispatch(new GetLastPage('pageId')).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);

    store.dispatch(new GetNextPage('pageId')).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(2);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(10);

    store.dispatch(new GetLastPage('pageId')).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(3);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);
  }));
});
