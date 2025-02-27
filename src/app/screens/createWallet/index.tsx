import { useState } from 'react';
import { CreateType } from './common';
import CreateFlow from './createFlow';
import SelectCreateType from './selectCreateType';

function CreateWallet() {
  const [createType, setCreateType] = useState<CreateType | undefined>();

  if (createType === undefined) {
    return <SelectCreateType onTypeSelected={setCreateType} />;
  }

  return <CreateFlow skipBackup={createType === CreateType.SKIP_BACKUP} />;
}

export default CreateWallet;
