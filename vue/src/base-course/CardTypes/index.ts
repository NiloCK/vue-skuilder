import BasicCard, { BasicCardDataShapes } from '@/courses/default/questions/basic/BasicCard';
import { DataShapeName } from '@/enums/DataShapeNames';
import { FieldType } from '@/enums/FieldType';
// import { BlanksCardDataShapes } from './FillInTheBlank';


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
    // BlanksCardDataShapes
  ],
  views: BasicCard.views
};
