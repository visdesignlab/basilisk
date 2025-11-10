import React, {
  useState, useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';

import AceEditor from 'react-ace';
import { Box, Group } from '@mantine/core';
import githubLight from 'ace-builds/src-noconflict/theme-github';
import githubDark from 'ace-builds/src-noconflict/theme-github_dark';

import { Registry, initializeTrrack } from '@trrack/core';

import 'ace-builds/src-noconflict/mode-hjson';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-toml';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

import { StimulusParams } from '../../../store/types';
import { PREFIX } from '../../../utils/Prefix';
// adding worker
function CodeEditorTest({ setAnswer, parameters, provenanceState }: StimulusParams<{language: string, imagePath: string | null, type: 'modifying' | 'writing' | 'reading', tabular: boolean}, Record<string, never>>): React.ReactElement {
  const [code, setCode] = useState<string>('');

  const isDarkMode = false;

  useEffect(() => {
    if (provenanceState && provenanceState.text !== null) {
      setCode(provenanceState.text);
    }
  }, [provenanceState]);

  // creating provenance tracking
  const { actions, trrack } = useMemo(() => {
    const reg = Registry.create();

    const typeAction = reg.register('type', (state, payload: string) => {
      state.text = payload;
      return state;
    });

    const trrackInst = initializeTrrack({
      registry: reg,
      initialState: {
        text: null,
      },
    });

    return {
      actions: {
        typeAction,
      },
      trrack: trrackInst,
    };
  }, []);

  let mode;
  if (parameters.language === 'plain_text') {
    mode = 'text';
  } else if (parameters.language === 'jsonc') {
    mode = 'json';
  } else {
    mode = parameters.language;
  }

  const editorOnChange = useCallback((rawCode: string) => {
    trrack.apply('Typing', actions.typeAction(rawCode));
    setAnswer({
    status:true,
      answers: {
        code: rawCode,
        error: rawCode,
      },
      provenanceGraph: trrack.graph.backend,
    });

    setCode(rawCode);
  }, [actions, setAnswer, trrack]);

  const editorRef = useRef<AceEditor>(null);

  useEffect(() => {
    if (isDarkMode) {
      editorRef.current?.editor.setTheme(githubDark);
    } else {
      editorRef.current?.editor.setTheme(githubLight);
    }
  }, [isDarkMode]);

  return (
    <Box>
      {/*  */}
      <Group gap={20} wrap="nowrap" style={{ height: 'calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 30px)' }}>
        {parameters.imagePath ? (
          <div style={{ flex: '0 0 50%' }}>
            <img
              src={PREFIX + parameters.imagePath}
              alt="Example"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        ) : null }

        <AceEditor
          ref={editorRef}
          mode={mode}
          width="100%"
          height="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 30px)"
          value={code}
          wrapEnabled
          onChange={editorOnChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
        />

      </Group>

      {/* validation */}
    </Box>

  );
}

export default CodeEditorTest;