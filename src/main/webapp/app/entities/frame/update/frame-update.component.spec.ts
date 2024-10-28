import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FrameService } from '../service/frame.service';
import { IFrame } from '../frame.model';
import { FrameFormService } from './frame-form.service';

import { FrameUpdateComponent } from './frame-update.component';

describe('Frame Management Update Component', () => {
  let comp: FrameUpdateComponent;
  let fixture: ComponentFixture<FrameUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let frameFormService: FrameFormService;
  let frameService: FrameService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FrameUpdateComponent],
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
      .overrideTemplate(FrameUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FrameUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    frameFormService = TestBed.inject(FrameFormService);
    frameService = TestBed.inject(FrameService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const frame: IFrame = { id: 456 };
      const creator: IUser = { id: 25496 };
      frame.creator = creator;

      const userCollection: IUser[] = [{ id: 15137 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [creator];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ frame });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const frame: IFrame = { id: 456 };
      const creator: IUser = { id: 9219 };
      frame.creator = creator;

      activatedRoute.data = of({ frame });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(creator);
      expect(comp.frame).toEqual(frame);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFrame>>();
      const frame = { id: 123 };
      jest.spyOn(frameFormService, 'getFrame').mockReturnValue(frame);
      jest.spyOn(frameService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ frame });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: frame }));
      saveSubject.complete();

      // THEN
      expect(frameFormService.getFrame).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(frameService.update).toHaveBeenCalledWith(expect.objectContaining(frame));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFrame>>();
      const frame = { id: 123 };
      jest.spyOn(frameFormService, 'getFrame').mockReturnValue({ id: null });
      jest.spyOn(frameService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ frame: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: frame }));
      saveSubject.complete();

      // THEN
      expect(frameFormService.getFrame).toHaveBeenCalled();
      expect(frameService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFrame>>();
      const frame = { id: 123 };
      jest.spyOn(frameService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ frame });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(frameService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
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
