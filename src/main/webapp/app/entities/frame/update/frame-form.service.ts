import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFrame, NewFrame } from '../frame.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFrame for edit and NewFrameFormGroupInput for create.
 */
type FrameFormGroupInput = IFrame | PartialWithRequiredKeyOf<NewFrame>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFrame | NewFrame> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type FrameFormRawValue = FormValueOf<IFrame>;

type NewFrameFormRawValue = FormValueOf<NewFrame>;

type FrameFormDefaults = Pick<NewFrame, 'id' | 'createdAt' | 'updatedAt'>;

type FrameFormGroupContent = {
  id: FormControl<FrameFormRawValue['id'] | NewFrame['id']>;
  title: FormControl<FrameFormRawValue['title']>;
  type: FormControl<FrameFormRawValue['type']>;
  description: FormControl<FrameFormRawValue['description']>;
  guidelineUrl: FormControl<FrameFormRawValue['guidelineUrl']>;
  imagePath: FormControl<FrameFormRawValue['imagePath']>;
  usageCount: FormControl<FrameFormRawValue['usageCount']>;
  createdAt: FormControl<FrameFormRawValue['createdAt']>;
  updatedAt: FormControl<FrameFormRawValue['updatedAt']>;
  creator: FormControl<FrameFormRawValue['creator']>;
};

export type FrameFormGroup = FormGroup<FrameFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FrameFormService {
  createFrameFormGroup(frame: FrameFormGroupInput = { id: null }): FrameFormGroup {
    const frameRawValue = this.convertFrameToFrameRawValue({
      ...this.getFormDefaults(),
      ...frame,
    });
    return new FormGroup<FrameFormGroupContent>({
      id: new FormControl(
        { value: frameRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(frameRawValue.title, {
        validators: [Validators.required],
      }),
      type: new FormControl(frameRawValue.type, {
        validators: [Validators.required],
      }),
      description: new FormControl(frameRawValue.description),
      guidelineUrl: new FormControl(frameRawValue.guidelineUrl),
      imagePath: new FormControl(frameRawValue.imagePath, {
        validators: [Validators.required],
      }),
      usageCount: new FormControl(frameRawValue.usageCount),
      createdAt: new FormControl(frameRawValue.createdAt),
      updatedAt: new FormControl(frameRawValue.updatedAt),
      creator: new FormControl(frameRawValue.creator),
    });
  }

  getFrame(form: FrameFormGroup): IFrame | NewFrame {
    return this.convertFrameRawValueToFrame(form.getRawValue() as FrameFormRawValue | NewFrameFormRawValue);
  }

  resetForm(form: FrameFormGroup, frame: FrameFormGroupInput): void {
    const frameRawValue = this.convertFrameToFrameRawValue({ ...this.getFormDefaults(), ...frame });
    form.reset(
      {
        ...frameRawValue,
        id: { value: frameRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FrameFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertFrameRawValueToFrame(rawFrame: FrameFormRawValue | NewFrameFormRawValue): IFrame | NewFrame {
    return {
      ...rawFrame,
      createdAt: dayjs(rawFrame.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawFrame.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertFrameToFrameRawValue(
    frame: IFrame | (Partial<NewFrame> & FrameFormDefaults),
  ): FrameFormRawValue | PartialWithRequiredKeyOf<NewFrameFormRawValue> {
    return {
      ...frame,
      createdAt: frame.createdAt ? frame.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: frame.updatedAt ? frame.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
