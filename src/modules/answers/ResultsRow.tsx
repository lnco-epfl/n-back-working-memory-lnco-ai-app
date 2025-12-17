import { FC } from 'react';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { IconButton } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export type ResultData = {
  name: string | undefined;
  nBackLevel?: number;
  accuracy?: number;
  correctCount?: number;
  totalTrials?: number;
  length: number;
  rawDataDownload: () => void;
};

const ResultsRow: FC<ResultData> = ({
  name,
  nBackLevel,
  accuracy,
  correctCount,
  totalTrials,
  length,
  rawDataDownload,
}) => (
  <TableRow>
    <TableCell>{name}</TableCell>
    <TableCell>{nBackLevel}</TableCell>
    <TableCell>{accuracy?.toFixed(1)}%</TableCell>
    <TableCell>
      {correctCount}/{totalTrials}
    </TableCell>
    <TableCell>{length}</TableCell>
    <TableCell>
      <IconButton
        onClick={(): void => {
          rawDataDownload();
        }}
      >
        <FileDownloadIcon />
      </IconButton>
    </TableCell>
  </TableRow>
);

export default ResultsRow;
