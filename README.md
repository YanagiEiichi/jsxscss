## jsxscss-loader

#### Usage

Change 

```
<Scss>
.abc {
  .def {
    color: red;
  }
}
</Scss>
```

to

```
<Css>{`
.abc .def {
  color: red;
}
`}</Css>
```
