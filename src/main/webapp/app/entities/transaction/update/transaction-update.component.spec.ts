import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IFrame } from 'app/entities/frame/frame.model';
import { FrameService } from 'app/entities/frame/service/frame.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ITransaction } from '../transaction.model';
import { TransactionService } from '../service/transaction.service';
import { TransactionFormService } from './transaction-form.service';

import { TransactionUpdateComponent } from './transaction-update.component';

describe('Transaction Management Update Component', () => {
  let comp: TransactionUpdateComponent;
  let fixture: ComponentFixture<TransactionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let transactionFormService: TransactionFormService;
  let transactionService: TransactionService;
  let frameService: FrameService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TransactionUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TransactionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TransactionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    transactionFormService = TestBed.inject(TransactionFormService);
    transactionService = TestBed.inject(TransactionService);
    frameService = TestBed.inject(FrameService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Frame query and add missing value', () => {
      const transaction: ITransaction = { id: 456 };
      const frame: IFrame = { id: 29530 };
      transaction.frame = frame;

      const frameCollection: IFrame[] = [{ id: 28808 }];
      jest.spyOn(frameService, 'query').mockReturnValue(of(new HttpResponse({ body: frameCollection })));
      const additionalFrames = [frame];
      const expectedCollection: IFrame[] = [...additionalFrames, ...frameCollection];
      jest.spyOn(frameService, 'addFrameToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ transaction });
      comp.ngOnInit();

      expect(frameService.query).toHaveBeenCalled();
      expect(frameService.addFrameToCollectionIfMissing).toHaveBeenCalledWith(
        frameCollection,
        ...additionalFrames.map(expect.objectContaining),
      );
      expect(comp.framesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call User query and add missing value', () => {
      const transaction: ITransaction = { id: 456 };
      const user: IUser = { id: 7700 };
      transaction.user = user;

      const userCollection: IUser[] = [{ id: 30794 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ transaction });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const transaction: ITransaction = { id: 456 };
      const frame: IFrame = { id: 17418 };
      transaction.frame = frame;
      const user: IUser = { id: 5134 };
      transaction.user = user;

      activatedRoute.data = of({ transaction });
      comp.ngOnInit();

      expect(comp.framesSharedCollection).toContain(frame);
      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.transaction).toEqual(transaction);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITransaction>>();
      const transaction = { id: 123 };
      jest.spyOn(transactionFormService, 'getTransaction').mockReturnValue(transaction);
      jest.spyOn(transactionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ transaction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: transaction }));
      saveSubject.complete();

      // THEN
      expect(transactionFormService.getTransaction).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(transactionService.update).toHaveBeenCalledWith(expect.objectContaining(transaction));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITransaction>>();
      const transaction = { id: 123 };
      jest.spyOn(transactionFormService, 'getTransaction').mockReturnValue({ id: null });
      jest.spyOn(transactionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ transaction: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: transaction }));
      saveSubject.complete();

      // THEN
      expect(transactionFormService.getTransaction).toHaveBeenCalled();
      expect(transactionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITransaction>>();
      const transaction = { id: 123 };
      jest.spyOn(transactionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ transaction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(transactionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareFrame', () => {
      it('Should forward to frameService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(frameService, 'compareFrame');
        comp.compareFrame(entity, entity2);
        expect(frameService.compareFrame).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
