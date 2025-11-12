import { useEffect, useState } from 'react';
import {
  Box,
  Blockquote,
  Divider,
  Group,
  Paper,
  Radio,
  Stack,
  Tabs,
  Text,
  Textarea,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import data from './DataLoader';
import TrustSlider from './TrustSlider';
import classes from './main.module.css';

const likertScale = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat Disagree' },
  { value: 4, label: 'Neither' },
  { value: 5, label: 'Somewhat Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly Agree' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartViewer({ parameters, setAnswer }: StimulusParams<any>) {
  const { exampleId, textType, question } = parameters as {
    exampleId: keyof typeof data;
    textType: string;
    question: string;
  };
  const exampleData = data[exampleId];
  const exampleImage = exampleData.image;
  let exampleText = '';
  if (textType === 'none') {
    exampleText = '';
  } else if (textType === 'all') {
    exampleText = `${exampleData.warning} ${exampleData.counter} ${exampleData.guide}`;
  } else {
    exampleText = exampleData[textType as keyof typeof exampleData];
  }
  const exampleSource = exampleData.source;
  const exampleTitle = exampleData.title;

  const exampleIntended = exampleData.intended;
  const exampleUnintended = exampleData.unintended;

  const [trustValue, setTrustValue] = useState<number>(-100);
  const [insightText, setInsightText] = useState<string>('');
  const [intendedValue, setIntendedValue] = useState<string>('');
  const [unintendedValue, setUnintendedValue] = useState<string>('');

  useEffect(() => {
    if (insightText.length < 10) {
      return;
    }
    if (question !== 'insight') {
      return;
    }
    setAnswer({
      status: true,
      answers: {
        insight: insightText,
      },
    });
  }, [setAnswer, question, insightText]);

  useEffect(() => {
    if (question !== 'trust') {
      return;
    }
    if (trustValue < 0) {
      return;
    }
    setAnswer({
      status: true,
      answers: {
        trust: trustValue,
      },
    });
  }, [setAnswer, question, trustValue]);


  const likertCards = likertScale.map((item) => (
    <Radio.Card
      className={classes.root}
      radius="md"
      value={item.value.toString()}
      key={item.label}
    >
      <Group wrap="nowrap" justify="flex-start">
        <Radio.Indicator />
        <div>
          <Text className={classes.label}>{item.label}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  return (
    <Box maw="1000px">
      <Stack m="md" ml={0}>
        <Text>Consider the following information slide:</Text>
        <Paper maw="800px" shadow="md" p="md" m="md" withBorder>
          <Stack gap="xs">
            <Text fw={700}>{exampleTitle}</Text>
            <img src={exampleImage} />
            {exampleText === '' ? null : (
              <Blockquote p="md" color="yellow" fw={500} fs="italic">
                {exampleText}
              </Blockquote>
            )}
            <Text size="xs" fs="italic" c="gray">
              {`Source: ${exampleSource}`}
            </Text>
          </Stack>
        </Paper>
        <Divider />

        <Tabs variant="outline" value={question}>
          {/* <Stack>
              <Textarea
                label="What observations and conclusions can you make based on this slide? Please enter in the box below, one observation per line:"
                withAsterisk
                autosize
                size="md"
                fw={500}
                minRows={3}
                value={insightText}
                onChange={(e) => setInsightText(e.currentTarget.value)}
              />
            </Stack> */}

          <Tabs.Panel value="trust">
            <Stack>
              <Text size="md" fw={500}>
                Would you consider this visualization trustworthy?
                <Text span c="red">
                  {' '}
                  *
                </Text>
              </Text>
              <TrustSlider
                trustValue={trustValue}
                setTrustValue={setTrustValue}
              />
            </Stack>
          </Tabs.Panel>  

          <Tabs.Panel value="agree">
            <Stack>
              <Text mt="md">
                Consider the two statements below. For each, do you agree that
                the slide above supports the statement?
                <Text span c="red">
                  {' '}
                  *
                </Text>
              </Text>
              <Text fw={700} mt="md">
                {exampleIntended}
              </Text>
              <Radio.Group
                value={intendedValue}
                onChange={setIntendedValue}
                name="agree"
              >
                <Group>{likertCards}</Group>
              </Radio.Group>
              <Text fw={700} mt="md">
                {exampleUnintended}
              </Text>
              <Radio.Group
                value={unintendedValue}
                onChange={setUnintendedValue}
                name="agree"
              >
                <Group>{likertCards}</Group>
              </Radio.Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default ChartViewer;
