import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAdvertisement, NewAdvertisement } from '../advertisement.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAdvertisement for edit and NewAdvertisementFormGroupInput for create.
 */
type AdvertisementFormGroupInput = IAdvertisement | PartialWithRequiredKeyOf<NewAdvertisement>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAdvertisement | NewAdvertisement> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AdvertisementFormRawValue = FormValueOf<IAdvertisement>;

type NewAdvertisementFormRawValue = FormValueOf<NewAdvertisement>;

type AdvertisementFormDefaults = Pick<NewAdvertisement, 'id' | 'active' | 'createdAt' | 'updatedAt'>;

type AdvertisementFormGroupContent = {
  id: FormControl<AdvertisementFormRawValue['id'] | NewAdvertisement['id']>;
  brand: FormControl<AdvertisementFormRawValue['brand']>;
  imagePath: FormControl<AdvertisementFormRawValue['imagePath']>;
  redirectUrl: FormControl<AdvertisementFormRawValue['redirectUrl']>;
  active: FormControl<AdvertisementFormRawValue['active']>;
  createdAt: FormControl<AdvertisementFormRawValue['createdAt']>;
  updatedAt: FormControl<AdvertisementFormRawValue['updatedAt']>;
};

export type AdvertisementFormGroup = FormGroup<AdvertisementFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AdvertisementFormService {
  createAdvertisementFormGroup(advertisement: AdvertisementFormGroupInput = { id: null }): AdvertisementFormGroup {
    const advertisementRawValue = this.convertAdvertisementToAdvertisementRawValue({
      ...this.getFormDefaults(),
      ...advertisement,
    });
    return new FormGroup<AdvertisementFormGroupContent>({
      id: new FormControl(
        { value: advertisementRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      brand: new FormControl(advertisementRawValue.brand, {
        validators: [Validators.required],
      }),
      imagePath: new FormControl(advertisementRawValue.imagePath, {
        validators: [Validators.required],
      }),
      redirectUrl: new FormControl(advertisementRawValue.redirectUrl, {
        validators: [Validators.required],
      }),
      active: new FormControl(advertisementRawValue.active, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(advertisementRawValue.createdAt),
      updatedAt: new FormControl(advertisementRawValue.updatedAt),
    });
  }

  getAdvertisement(form: AdvertisementFormGroup): IAdvertisement | NewAdvertisement {
    return this.convertAdvertisementRawValueToAdvertisement(form.getRawValue() as AdvertisementFormRawValue | NewAdvertisementFormRawValue);
  }

  resetForm(form: AdvertisementFormGroup, advertisement: AdvertisementFormGroupInput): void {
    const advertisementRawValue = this.convertAdvertisementToAdvertisementRawValue({ ...this.getFormDefaults(), ...advertisement });
    form.reset(
      {
        ...advertisementRawValue,
        id: { value: advertisementRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AdvertisementFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      active: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertAdvertisementRawValueToAdvertisement(
    rawAdvertisement: AdvertisementFormRawValue | NewAdvertisementFormRawValue,
  ): IAdvertisement | NewAdvertisement {
    return {
      ...rawAdvertisement,
      createdAt: dayjs(rawAdvertisement.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawAdvertisement.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertAdvertisementToAdvertisementRawValue(
    advertisement: IAdvertisement | (Partial<NewAdvertisement> & AdvertisementFormDefaults),
  ): AdvertisementFormRawValue | PartialWithRequiredKeyOf<NewAdvertisementFormRawValue> {
    return {
      ...advertisement,
      createdAt: advertisement.createdAt ? advertisement.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: advertisement.updatedAt ? advertisement.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
