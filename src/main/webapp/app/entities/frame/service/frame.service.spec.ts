import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFrame } from '../frame.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../frame.test-samples';

import { FrameService, RestFrame } from './frame.service';

const requireRestSample: RestFrame = {
  ...sampleWithRequiredData,
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
  updatedAt: sampleWithRequiredData.updatedAt?.toJSON(),
};

describe('Frame Service', () => {
  let service: FrameService;
  let httpMock: HttpTestingController;
  let expectedResult: IFrame | IFrame[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FrameService);
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

    it('should create a Frame', () => {
      const frame = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(frame).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Frame', () => {
      const frame = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(frame).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Frame', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Frame', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Frame', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFrameToCollectionIfMissing', () => {
      it('should add a Frame to an empty array', () => {
        const frame: IFrame = sampleWithRequiredData;
        expectedResult = service.addFrameToCollectionIfMissing([], frame);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(frame);
      });

      it('should not add a Frame to an array that contains it', () => {
        const frame: IFrame = sampleWithRequiredData;
        const frameCollection: IFrame[] = [
          {
            ...frame,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFrameToCollectionIfMissing(frameCollection, frame);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Frame to an array that doesn't contain it", () => {
        const frame: IFrame = sampleWithRequiredData;
        const frameCollection: IFrame[] = [sampleWithPartialData];
        expectedResult = service.addFrameToCollectionIfMissing(frameCollection, frame);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(frame);
      });

      it('should add only unique Frame to an array', () => {
        const frameArray: IFrame[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const frameCollection: IFrame[] = [sampleWithRequiredData];
        expectedResult = service.addFrameToCollectionIfMissing(frameCollection, ...frameArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const frame: IFrame = sampleWithRequiredData;
        const frame2: IFrame = sampleWithPartialData;
        expectedResult = service.addFrameToCollectionIfMissing([], frame, frame2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(frame);
        expect(expectedResult).toContain(frame2);
      });

      it('should accept null and undefined values', () => {
        const frame: IFrame = sampleWithRequiredData;
        expectedResult = service.addFrameToCollectionIfMissing([], null, frame, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(frame);
      });

      it('should return initial array if no Frame is added', () => {
        const frameCollection: IFrame[] = [sampleWithRequiredData];
        expectedResult = service.addFrameToCollectionIfMissing(frameCollection, undefined, null);
        expect(expectedResult).toEqual(frameCollection);
      });
    });

    describe('compareFrame', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFrame(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareFrame(entity1, entity2);
        const compareResult2 = service.compareFrame(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareFrame(entity1, entity2);
        const compareResult2 = service.compareFrame(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareFrame(entity1, entity2);
        const compareResult2 = service.compareFrame(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
