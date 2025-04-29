
import React from 'react';
import CheckUpdateButton from '../update/CheckUpdateButton';
import UpdatesMenu from '../update/UpdatesMenu';

export const UpdateArea: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <CheckUpdateButton />
      <UpdatesMenu />
    </div>
  );
};

export default UpdateArea;
