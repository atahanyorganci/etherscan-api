name    := `jq -r '.name' package.json`
version := `jq -r '.version' package.json`

test_dir      := justfile_directory() / "test"
cache_dir     := test_dir / "cache"
cache_archive := "cache.tar.gz"

format:
    bun run format

lint:
    bun run lint

check:
    bun run check

test: decompress
    bun run test

build:
    bun run build

attw:
    bun run attw

compress:
    #!/usr/bin/env bash

    cd {{ test_dir }}
    tar -czvf cache.tar.gz cache
    cd -

decompress:
    #!/usr/bin/env bash

    if [ -d "{{ cache_dir }}" ]; then
        exit 0
    fi

    cd {{ test_dir }}
    tar -xzvf cache.tar.gz
    cd -

ci: format lint check test

@pre-publish: ci build attw
    echo "Ready for publishing"

[private]
is-clean:
    #!/usr/bin/env bash

    if [[ -n $(git status --porcelain) ]]; then
        echo "Repository is dirty, commit or stash changes and try again."
        exit 1
    fi

[confirm("Are you sure you want to publish new version of the package?")]
@publish NEW_VERSION: is-clean pre-publish
    echo "Updating {{ name }} from v{{ version }} to v{{ NEW_VERSION }}"
    sed -i 's/"version": "{{ version }}"/"version": "{{ NEW_VERSION }}"/g' package.json jsr.json
    git add package.json jsr.json
    git commit -m "{{ NEW_VERSION }}"
    git tag 'v{{ NEW_VERSION }}'

update-test-data:
    REMOTE=true PERSIST=true bun run test
