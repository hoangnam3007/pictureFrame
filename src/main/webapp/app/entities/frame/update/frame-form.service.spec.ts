import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../frame.test-samples';

import { FrameFormService } from './frame-form.service';

describe('Frame Form Service', () => {
  let service: FrameFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrameFormService);
  });

  describe('Service methods', () => {
    describe('createFrameFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFrameFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            type: expect.any(Object),
            description: expect.any(Object),
            guidelineUrl: expect.any(Object),
            imagePath: expect.any(Object),
            usageCount: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            creator: expect.any(Object),
          }),
        );
      });

      it('passing IFrame should create a new form with FormGroup', () => {
        const formGroup = service.createFrameFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            type: expect.any(Object),
            description: expect.any(Object),
            guidelineUrl: expect.any(Object),
            imagePath: expect.any(Object),
            usageCount: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            creator: expect.any(Object),
          }),
        );
      });
    });

    describe('getFrame', () => {
      it('should return NewFrame for default Frame initial value', () => {
        const formGroup = service.createFrameFormGroup(sampleWithNewData);

        const frame = service.getFrame(formGroup) as any;

        expect(frame).toMatchObject(sampleWithNewData);
      });

      it('should return NewFrame for empty Frame initial value', () => {
        const formGroup = service.createFrameFormGroup();

        const frame = service.getFrame(formGroup) as any;

        expect(frame).toMatchObject({});
      });

      it('should return IFrame', () => {
        const formGroup = service.createFrameFormGroup(sampleWithRequiredData);

        const frame = service.getFrame(formGroup) as any;

        expect(frame).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFrame should not enable id FormControl', () => {
        const formGroup = service.createFrameFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFrame should disable id FormControl', () => {
        const formGroup = service.createFrameFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
