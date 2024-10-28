import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAdvertisement } from '../advertisement.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../advertisement.test-samples';

import { AdvertisementService, RestAdvertisement } from './advertisement.service';

const requireRestSample: RestAdvertisement = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Advertisement Service', () => {
  let service: AdvertisementService;
  let httpMock: HttpTestingController;
  let expectedResult: IAdvertisement | IAdvertisement[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AdvertisementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Advertisement', () => {
      const advertisement = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(advertisement).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Advertisement', () => {
      const advertisement = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(advertisement).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Advertisement', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Advertisement', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Advertisement', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addAdvertisementToCollectionIfMissing', () => {
      it('should add a Advertisement to an empty array', () => {
        const advertisement: IAdvertisement = sampleWithRequiredData;
        expectedResult = service.addAdvertisementToCollectionIfMissing([], advertisement);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advertisement);
      });

      it('should not add a Advertisement to an array that contains it', () => {
        const advertisement: IAdvertisement = sampleWithRequiredData;
        const advertisementCollection: IAdvertisement[] = [
          {
            ...advertisement,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAdvertisementToCollectionIfMissing(advertisementCollection, advertisement);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Advertisement to an array that doesn't contain it", () => {
        const advertisement: IAdvertisement = sampleWithRequiredData;
        const advertisementCollection: IAdvertisement[] = [sampleWithPartialData];
        expectedResult = service.addAdvertisementToCollectionIfMissing(advertisementCollection, advertisement);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advertisement);
      });

      it('should add only unique Advertisement to an array', () => {
        const advertisementArray: IAdvertisement[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const advertisementCollection: IAdvertisement[] = [sampleWithRequiredData];
        expectedResult = service.addAdvertisementToCollectionIfMissing(advertisementCollection, ...advertisementArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const advertisement: IAdvertisement = sampleWithRequiredData;
        const advertisement2: IAdvertisement = sampleWithPartialData;
        expectedResult = service.addAdvertisementToCollectionIfMissing([], advertisement, advertisement2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advertisement);
        expect(expectedResult).toContain(advertisement2);
      });

      it('should accept null and undefined values', () => {
        const advertisement: IAdvertisement = sampleWithRequiredData;
        expectedResult = service.addAdvertisementToCollectionIfMissing([], null, advertisement, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(advertisement);
      });

      it('should return initial array if no Advertisement is added', () => {
        const advertisementCollection: IAdvertisement[] = [sampleWithRequiredData];
        expectedResult = service.addAdvertisementToCollectionIfMissing(advertisementCollection, undefined, null);
        expect(expectedResult).toEqual(advertisementCollection);
      });
    });

    describe('compareAdvertisement', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAdvertisement(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareAdvertisement(entity1, entity2);
        const compareResult2 = service.compareAdvertisement(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareAdvertisement(entity1, entity2);
        const compareResult2 = service.compareAdvertisement(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareAdvertisement(entity1, entity2);
        const compareResult2 = service.compareAdvertisement(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
