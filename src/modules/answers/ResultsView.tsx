import { FC } from 'react';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';
import { DataCollection } from 'jspsych';

import { hooks } from '@/config/queryClient';

import { ExperimentResult } from '../config/appResults';
import ResultsRow from './ResultsRow';

const downloadJson: (json: string, filename: string) => void = (
  json: string,
  filename: string,
): void => {
  const blob = new Blob([json], { type: 'application/json' }); // Create a blob from the string
  const url = URL.createObjectURL(blob); // Create a URL for the blob
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.setAttribute('hidden', '');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

const ResultsView: FC = () => {
  const { data: appData } = hooks.useAppData<ExperimentResult>();

  const allData = (): string => {
    const completeJSON: string[] = [];
    appData?.forEach((data) => {
      const experimentJSON = data.data.rawData
        ? new DataCollection(data.data.rawData.trials)
        : undefined;
      if (experimentJSON) {
        completeJSON.push(experimentJSON.json());
      }
    });
    return `[${completeJSON.toString()}]`;
  };

  return (
    <Stack spacing={2}>
      <Stack justifyContent="space-between" direction="row">
        <Typography variant="h3">N-Back Results</Typography>
        <Button
          variant="text"
          onClick={() => {
            downloadJson(
              allData(),
              `nback_all_${format(new Date(), 'yyyyMMdd_HH.mm')}.json`,
            );
          }}
        >
          <FileDownloadIcon />
          Export All
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="answers table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>N-Level</TableCell>
              <TableCell>Accuracy (%)</TableCell>
              <TableCell>Correct/Total</TableCell>
              <TableCell>Data Size</TableCell>
              <TableCell>Export</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appData?.map((data) => {
              const rawData = data.data.rawData
                ? new DataCollection(data.data.rawData.trials)
                : undefined;
              const trials = rawData?.values() || [];
              const correctTrials = trials.filter(
                (trial: { correct?: boolean }) => trial.correct === true,
              );
              const accuracy =
                trials.length > 0
                  ? (correctTrials.length / trials.length) * 100
                  : 0;
              return (
                <ResultsRow
                  key={data.id}
                  name={data.creator?.name}
                  nBackLevel={data.data.settings?.nBackSettings?.nLevel}
                  accuracy={accuracy}
                  correctCount={correctTrials.length}
                  totalTrials={trials.length}
                  length={rawData ? rawData.count() : 0}
                  rawDataDownload={() =>
                    downloadJson(
                      rawData ? rawData.json() : '[]',
                      `nback_${data.creator?.name}_${data.updatedAt}_${format(new Date(), 'yyyyMMdd_HH.mm')}.json`,
                    )
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default ResultsView;
