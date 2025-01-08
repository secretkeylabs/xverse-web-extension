# CardRow

Usage:

```tsx
// Simple card with some content
const example1 = <Card>Simple card</Card>;

// Card with spaced out rows
const example2 = (
  <Card>
    <CardStack>
      <CardRowPrimary title="Title1" value="Value1" />
      <CardRowPrimary title="Title2" value="Value2" />
      <CardRowPrimary title="Title3" value="Value3" />
    </CardStack>
  </Card>
);

// Card with primary and secondary row content
const example3 = (
  <Card>
    <CardStack>
      <CardRowContainer>
        <CardRowPrimary title="Title1.1" value="Value1.1" />
        <CardRowSecondary
          title="Optional title 1.2"
          value="Optional value 1.2"
        />
      </CardRowContainer>
      <CardRowContainer>
        <CardRowPrimary title="Title2.1" value="Value2.1" />
        <CardRowSecondary
          title="Optional title 2.2"
          value="Optional value 2.2"
        />
      </CardRowContainer>
    </CardStack>
  </Card>
);

// Both titles and values can be arbitrary React elements
const example4 = (
  <Card>
    <CardStack>
      <CardRowPrimary
        title={<div>Custom title</div>}
        value={<CopyableText text="bc1q...abcd" />}
      />
    </CardStack>
  </Card>
);
```
