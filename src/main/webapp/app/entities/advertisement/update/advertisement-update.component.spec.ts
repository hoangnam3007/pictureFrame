import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { AdvertisementService } from '../service/advertisement.service';
import { IAdvertisement } from '../advertisement.model';
import { AdvertisementFormService } from './advertisement-form.service';

import { AdvertisementUpdateComponent } from './advertisement-update.component';

describe('Advertisement Management Update Component', () => {
  let comp: AdvertisementUpdateComponent;
  let fixture: ComponentFixture<AdvertisementUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let advertisementFormService: AdvertisementFormService;
  let advertisementService: AdvertisementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdvertisementUpdateComponent],
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
      .overrideTemplate(AdvertisementUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AdvertisementUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    advertisementFormService = TestBed.inject(AdvertisementFormService);
    advertisementService = TestBed.inject(AdvertisementService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const advertisement: IAdvertisement = { id: 456 };

      activatedRoute.data = of({ advertisement });
      comp.ngOnInit();

      expect(comp.advertisement).toEqual(advertisement);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvertisement>>();
      const advertisement = { id: 123 };
      jest.spyOn(advertisementFormService, 'getAdvertisement').mockReturnValue(advertisement);
      jest.spyOn(advertisementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advertisement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advertisement }));
      saveSubject.complete();

      // THEN
      expect(advertisementFormService.getAdvertisement).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(advertisementService.update).toHaveBeenCalledWith(expect.objectContaining(advertisement));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvertisement>>();
      const advertisement = { id: 123 };
      jest.spyOn(advertisementFormService, 'getAdvertisement').mockReturnValue({ id: null });
      jest.spyOn(advertisementService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advertisement: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: advertisement }));
      saveSubject.complete();

      // THEN
      expect(advertisementFormService.getAdvertisement).toHaveBeenCalled();
      expect(advertisementService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAdvertisement>>();
      const advertisement = { id: 123 };
      jest.spyOn(advertisementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advertisement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(advertisementService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
