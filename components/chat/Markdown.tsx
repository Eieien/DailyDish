import { View, Text, Linking, Platform } from 'react-native';

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g;

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'ordered'; marker: string; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'paragraph'; text: string };

function parseBlocks(input: string): Block[] {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      blocks.push({ kind: 'bullet', text: bullet[1] });
      i += 1;
      continue;
    }

    const ordered = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ordered) {
      blocks.push({ kind: 'ordered', marker: ordered[1], text: ordered[2] });
      i += 1;
      continue;
    }

    blocks.push({ kind: 'paragraph', text: line });
    i += 1;
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let token = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Text key={`${keyPrefix}-p${token}`}>{text.slice(lastIndex, match.index)}</Text>);
      token += 1;
    }

    const raw = match[0];
    const key = `${keyPrefix}-m${token}`;
    token += 1;

    if (raw.startsWith('**')) {
      nodes.push(
        <Text key={key} className="font-urbanist-bold">
          {raw.slice(2, -2)}
        </Text>
      );
    } else if (raw.startsWith('`')) {
      nodes.push(
        <Text key={key} style={{ fontFamily: MONO }}>
          {raw.slice(1, -1)}
        </Text>
      );
    } else if (raw.startsWith('[')) {
      const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        nodes.push(
          <Text
            key={key}
            className="text-primary underline"
            onPress={() => Linking.openURL(link[2])}>
            {link[1]}
          </Text>
        );
      }
    } else {
      nodes.push(
        <Text key={key} style={{ fontStyle: 'italic' }}>
          {raw.slice(1, -1)}
        </Text>
      );
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Text key={`${keyPrefix}-p${token}`}>{text.slice(lastIndex)}</Text>);
  }

  return nodes;
}

const HEADING_SIZE: Record<number, string> = {
  1: 'text-xl',
  2: 'text-lg',
  3: 'text-base',
  4: 'text-base',
  5: 'text-sm',
  6: 'text-sm',
};

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const blocks = parseBlocks(content);

  return (
    <View>
      {blocks.map((block, index) => {
        const spacing = index === blocks.length - 1 ? '' : 'mb-1.5';
        const key = `b${index}`;

        if (block.kind === 'heading') {
          return (
            <Text
              key={key}
              className={`font-urbanist-bold text-ink ${HEADING_SIZE[block.level]} ${spacing}`}>
              {renderInline(block.text, key)}
            </Text>
          );
        }

        if (block.kind === 'code') {
          return (
            <View key={key} className={`rounded-xl bg-neutral px-3 py-2 ${spacing}`}>
              <Text style={{ fontFamily: MONO }} className="text-[13px] text-ink">
                {block.text}
              </Text>
            </View>
          );
        }

        if (block.kind === 'bullet') {
          return (
            <View key={key} className={`flex-row ${spacing}`}>
              <Text className="mr-2 font-urbanist text-[15px] leading-5 text-primary">•</Text>
              <Text className="flex-1 font-urbanist text-[15px] leading-5 text-ink">
                {renderInline(block.text, key)}
              </Text>
            </View>
          );
        }

        if (block.kind === 'ordered') {
          return (
            <View key={key} className={`flex-row ${spacing}`}>
              <Text className="mr-2 font-urbanist-semibold text-[15px] leading-5 text-primary">
                {block.marker}.
              </Text>
              <Text className="flex-1 font-urbanist text-[15px] leading-5 text-ink">
                {renderInline(block.text, key)}
              </Text>
            </View>
          );
        }

        return (
          <Text key={key} className={`font-urbanist text-[15px] leading-5 text-ink ${spacing}`}>
            {renderInline(block.text, key)}
          </Text>
        );
      })}
    </View>
  );
};
