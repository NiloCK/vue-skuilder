import BasicCard, { BasicCardDataShapes } from '@/base-course/CardTypes/BasicCard';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';


export default {
  dataShapes: [
    {
      name: DataShapeName.Basic,
      fields: [
        {
          name: 'Front',
          type: FieldType.MARKDOWN
        },
        {
          name: 'Back',
          type: FieldType.MARKDOWN
        }
      ]
    }
  ],
  views: BasicCard.views
};
