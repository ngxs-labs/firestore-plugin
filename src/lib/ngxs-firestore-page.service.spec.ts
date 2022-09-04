import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { Action, NgxsModule, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { BehaviorSubject } from 'rxjs';
import { StreamEmitted } from './action-decorator-helpers';
import { GetLastPage, GetNextPage } from './actions';
import { NgxsFirestoreConnect } from './ngxs-firestore-connect.service';
import { NgxsFirestorePageService } from './ngxs-firestore-page.service';
import { NgxsFirestoreModule } from './ngxs-firestore.module';
import { Emitted, Page } from './types';

jest.mock('@angular/fire/firestore');

describe('NgxsFirestorePage', () => {
  let store: Store;

  const mockFirestoreStream = jest.fn();
  const mockCreateId = jest.fn();

  const mockDoc = jest.mocked(doc);
  mockDoc.mockImplementation(() => ({ id: mockCreateId(), withConverter: jest.fn() } as unknown as DocumentReference));

  class TestActionGetPages {
    static type = 'TEST ACTION GET PAGES';
  }

  class AnotherTestActionGetPages {
    static type = 'ANOTHER TEST ACTION GET PAGES';
  }

  class MaxPageSizeTestActionGetPages {
    static type = 'MAX PAGE SIZE TEST ACTION GET PAGES';
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

  @State({
    name: 'another_test'
  })
  @Injectable()
  class AnotherTestState implements NgxsOnInit {
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
      this.ngxsFirestoreConnect.connect(AnotherTestActionGetPages, {
        to: () =>
          this.ngxsFirestorePage.create((pageFn) => mockFirestoreStream((ref) => pageFn(ref)), 5, [
            { fieldPath: 'title' }
          ])
      });
    }

    @Action(StreamEmitted(AnotherTestActionGetPages))
    getPageEmitted(ctx: StateContext<any>, { action, payload }: Emitted<TestActionGetPages, Page<any>>) {
      ctx.setState(patch({ results: payload.results || [], pageId: payload.pageId, pageSize: payload.pageSize }));
    }
  }

  @State({
    name: 'max_page_size_test'
  })
  @Injectable()
  class MaxPageSizeTestState implements NgxsOnInit {
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
      this.ngxsFirestoreConnect.connect(MaxPageSizeTestActionGetPages, {
        to: () =>
          this.ngxsFirestorePage.create((pageFn) => mockFirestoreStream((ref) => pageFn(ref)), 5000, [
            { fieldPath: 'title' }
          ])
      });
    }

    @Action(StreamEmitted(MaxPageSizeTestActionGetPages))
    getPageEmitted(ctx: StateContext<any>, { action, payload }: Emitted<MaxPageSizeTestActionGetPages, Page<any>>) {
      ctx.setState(patch({ results: payload.results || [], pageId: payload.pageId, pageSize: payload.pageSize }));
    }
  }

  const page1 = ['1', '2', '3'];
  // const page2 = ['1', '2', '3', '4', '5', '6'];
  // const page3 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TestState, AnotherTestState, MaxPageSizeTestState]), NgxsFirestoreModule.forRoot()],
      providers: [{ provide: Firestore, useValue: jest.fn() }]
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

  test('should skip if page > 10000', fakeAsync(() => {
    mockCreateId.mockReturnValue('pageId');

    const stream = new BehaviorSubject(page1);
    mockFirestoreStream.mockReturnValue(stream.asObservable());

    store.dispatch(new MaxPageSizeTestActionGetPages()).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(MaxPageSizeTestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(MaxPageSizeTestState.pageSize)).toEqual(5000);

    store.dispatch(new GetNextPage('pageId')).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(2);
    expect(store.selectSnapshot(MaxPageSizeTestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(MaxPageSizeTestState.pageSize)).toEqual(10000);

    store.dispatch(new GetNextPage('pageId')).subscribe((_) => {});
    tick(1);

    expect(mockFirestoreStream).toHaveBeenCalledTimes(2);
    expect(store.selectSnapshot(MaxPageSizeTestState.pageId)).toEqual('pageId');
    expect(store.selectSnapshot(MaxPageSizeTestState.pageSize)).toEqual(10000);
  }));

  test('should support multiple page connections', fakeAsync(() => {
    mockCreateId.mockReturnValueOnce('firstId').mockReturnValueOnce('secondId');

    const stream = new BehaviorSubject(page1);
    mockFirestoreStream.mockReturnValue(stream.asObservable());

    store.dispatch(new TestActionGetPages()).subscribe((_) => {});
    tick(1);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('firstId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);
    expect(store.selectSnapshot(AnotherTestState.pageId)).toEqual(undefined);
    expect(store.selectSnapshot(AnotherTestState.pageSize)).toEqual(undefined);

    store.dispatch(new AnotherTestActionGetPages()).subscribe((_) => {});
    tick(1);
    expect(store.selectSnapshot(TestState.pageId)).toEqual('firstId');
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(5);
    expect(store.selectSnapshot(AnotherTestState.pageId)).toEqual('secondId');
    expect(store.selectSnapshot(AnotherTestState.pageSize)).toEqual(5);

    store.dispatch(new GetNextPage('firstId')).subscribe((_) => {});
    tick(1);
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(10);
    expect(store.selectSnapshot(AnotherTestState.pageSize)).toEqual(5);

    store.dispatch(new GetNextPage('secondId')).subscribe((_) => {});
    tick(1);
    expect(store.selectSnapshot(TestState.pageSize)).toEqual(10);
    expect(store.selectSnapshot(AnotherTestState.pageSize)).toEqual(10);
  }));
});
