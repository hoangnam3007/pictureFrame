import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../advertisement.test-samples';

import { AdvertisementFormService } from './advertisement-form.service';

describe('Advertisement Form Service', () => {
  let service: AdvertisementFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvertisementFormService);
  });

  describe('Service methods', () => {
    describe('createAdvertisementFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAdvertisementFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            brand: expect.any(Object),
            imagePath: expect.any(Object),
            redirectUrl: expect.any(Object),
            active: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          }),
        );
      });

      it('passing IAdvertisement should create a new form with FormGroup', () => {
        const formGroup = service.createAdvertisementFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            brand: expect.any(Object),
            imagePath: expect.any(Object),
            redirectUrl: expect.any(Object),
            active: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
          }),
        );
      });
    });

    describe('getAdvertisement', () => {
      it('should return NewAdvertisement for default Advertisement initial value', () => {
        const formGroup = service.createAdvertisementFormGroup(sampleWithNewData);

        const advertisement = service.getAdvertisement(formGroup) as any;

        expect(advertisement).toMatchObject(sampleWithNewData);
      });

      it('should return NewAdvertisement for empty Advertisement initial value', () => {
        const formGroup = service.createAdvertisementFormGroup();

        const advertisement = service.getAdvertisement(formGroup) as any;

        expect(advertisement).toMatchObject({});
      });

      it('should return IAdvertisement', () => {
        const formGroup = service.createAdvertisementFormGroup(sampleWithRequiredData);

        const advertisement = service.getAdvertisement(formGroup) as any;

        expect(advertisement).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAdvertisement should not enable id FormControl', () => {
        const formGroup = service.createAdvertisementFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAdvertisement should disable id FormControl', () => {
        const formGroup = service.createAdvertisementFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
